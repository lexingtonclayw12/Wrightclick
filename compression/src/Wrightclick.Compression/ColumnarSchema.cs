
namespace Wrightclick.Compression;

/// <summary>
/// Describes how a row type maps onto columns, and encodes/decodes CJC v1
/// frames. One instance is shared by the API and the Blazor client, so the
/// encoder and decoder cannot drift apart.
///
/// Frame layout (see compression/bench/cjc.mjs for the portable reference):
///
///   magic        4 bytes "WCC1"
///   rowCount     uvarint
///   colCount     uvarint
///   per column:  name, encoding u8, nullable u8, [presence bitmap],
///                payloadLen uvarint, payload
///
/// Brotli is applied to the finished frame by <see cref="CjcSerializer"/>
/// rather than inside the codec, so column payloads stay byte-stable
/// regardless of transport. The delta protocol's chunk hashes depend on that.
/// </summary>
public sealed class ColumnarSchema<TRow>(IReadOnlyList<IColumn<TRow>> columns, Func<TRow> factory)
{
    private static readonly byte[] Magic = "WCC1"u8.ToArray();

    private readonly Dictionary<string, IColumn<TRow>> _byName =
        columns.ToDictionary(c => c.Name, StringComparer.Ordinal);

    public IReadOnlyList<IColumn<TRow>> Columns { get; } = columns;

    public byte[] Encode(IReadOnlyList<TRow> rows)
    {
        var w = new ByteWriter(Math.Max(64 * 1024, rows.Count * 8));
        w.WriteBytes(Magic);
        w.WriteUVarint((ulong)rows.Count);
        w.WriteUVarint((ulong)Columns.Count);
        foreach (var column in Columns) column.Write(rows, w);
        return w.ToArray();
    }

    public List<TRow> Decode(ReadOnlySpan<byte> frame)
    {
        var r = new ByteReader(frame);
        if (!r.Take(4).SequenceEqual(Magic)) throw new InvalidDataException("not a CJC frame");

        var rowCount = (int)r.ReadUVarint();
        var columnCount = (int)r.ReadUVarint();

        var rows = new TRow[rowCount];
        for (var i = 0; i < rowCount; i++) rows[i] = factory();

        for (var c = 0; c < columnCount; c++)
        {
            var name = r.ReadString();
            var encoding = (ColumnEncoding)r.ReadU8();
            var nullable = r.ReadU8() == 1;

            bool[]? presence = null;
            var presentCount = rowCount;
            if (nullable)
            {
                var bitmap = r.Take((rowCount + 7) / 8);
                var bits = new BitReader(bitmap);
                presence = new bool[rowCount];
                presentCount = 0;
                for (var i = 0; i < rowCount; i++)
                {
                    presence[i] = bits.Read(1) == 1;
                    if (presence[i]) presentCount++;
                }
            }

            var payload = r.Take((int)r.ReadUVarint());

            // An unknown column is skipped rather than fatal: that is what lets
            // the server add a column without breaking already-deployed clients.
            if (_byName.TryGetValue(name, out var column))
            {
                column.Read(rows, encoding, presence, payload, presentCount);
            }
        }

        return [.. rows];
    }
}

/// <summary>Factory helpers for the common SQL column shapes.</summary>
public static class Column
{
    public static Int64Column<TRow> Int64<TRow>(string name, Func<TRow, long> get, Action<TRow, long> set, ColumnEncoding encoding = ColumnEncoding.Auto)
        => new() { Name = name, Get = r => get(r), Set = (r, v) => set(r, v!.Value), Encoding = encoding };

    public static Int64Column<TRow> Int64Null<TRow>(string name, Func<TRow, long?> get, Action<TRow, long?> set, ColumnEncoding encoding = ColumnEncoding.Auto)
        => new() { Name = name, Get = get, Set = set, Encoding = encoding };

    public static Int64Column<TRow> Int32<TRow>(string name, Func<TRow, int> get, Action<TRow, int> set, ColumnEncoding encoding = ColumnEncoding.Auto)
        => new() { Name = name, Get = r => get(r), Set = (r, v) => set(r, (int)v!.Value), Encoding = encoding };

    public static Int64Column<TRow> Int32Null<TRow>(string name, Func<TRow, int?> get, Action<TRow, int?> set, ColumnEncoding encoding = ColumnEncoding.Auto)
        => new() { Name = name, Get = r => get(r), Set = (r, v) => set(r, (int?)v), Encoding = encoding };

    /// <summary>
    /// DateTime as UTC ticks - lossless, and matches what System.Text.Json
    /// round-trips. Ticks cost ~2 bytes/row more than milliseconds under delta
    /// encoding; use <see cref="DateTimeMillis"/> when sub-millisecond
    /// precision genuinely does not matter.
    /// </summary>
    public static Int64Column<TRow> DateTimeTicks<TRow>(string name, Func<TRow, DateTime> get, Action<TRow, DateTime> set)
        => new()
        {
            Name = name,
            Get = r => get(r).Ticks,
            Set = (r, v) => set(r, new DateTime(v!.Value, DateTimeKind.Utc)),
        };

    public static Int64Column<TRow> DateTimeTicksNull<TRow>(string name, Func<TRow, DateTime?> get, Action<TRow, DateTime?> set)
        => new()
        {
            Name = name,
            Get = r => get(r)?.Ticks,
            Set = (r, v) => set(r, v is null ? null : new DateTime(v.Value, DateTimeKind.Utc)),
        };

    public static Int64Column<TRow> DateTimeMillis<TRow>(string name, Func<TRow, DateTime> get, Action<TRow, DateTime> set)
        => new()
        {
            Name = name,
            Get = r => (long)(get(r) - DateTime.UnixEpoch).TotalMilliseconds,
            Set = (r, v) => set(r, DateTime.UnixEpoch.AddMilliseconds(v!.Value)),
        };

    public static Int64Column<TRow> DateTimeMillisNull<TRow>(string name, Func<TRow, DateTime?> get, Action<TRow, DateTime?> set)
        => new()
        {
            Name = name,
            Get = r => get(r) is { } d ? (long)(d - DateTime.UnixEpoch).TotalMilliseconds : null,
            Set = (r, v) => set(r, v is null ? null : DateTime.UnixEpoch.AddMilliseconds(v.Value)),
        };

    /// <summary>
    /// decimal scaled to an integer. SQL money/decimal(18,2) becomes a varint
    /// of a few bytes instead of a 16-byte decimal or a long JSON literal.
    /// <paramref name="scale"/> must match the column's SQL scale or the value
    /// is truncated.
    /// </summary>
    public static Int64Column<TRow> Decimal<TRow>(string name, Func<TRow, decimal> get, Action<TRow, decimal> set, int scale = 2)
    {
        var factor = (decimal)Math.Pow(10, scale);
        return new Int64Column<TRow>
        {
            Name = name,
            Get = r => (long)decimal.Round(get(r) * factor, 0, MidpointRounding.AwayFromZero),
            Set = (r, v) => set(r, v!.Value / factor),
        };
    }

    public static StringColumn<TRow> String<TRow>(string name, Func<TRow, string> get, Action<TRow, string> set, ColumnEncoding encoding = ColumnEncoding.Auto)
        => new() { Name = name, Get = r => get(r), Set = (r, v) => set(r, v ?? string.Empty), Encoding = encoding };

    public static StringColumn<TRow> StringNull<TRow>(string name, Func<TRow, string?> get, Action<TRow, string?> set, ColumnEncoding encoding = ColumnEncoding.Auto)
        => new() { Name = name, Get = get, Set = set, Encoding = encoding };

    /// <summary>
    /// Guid via its canonical string form, which the dictionary encoding
    /// collapses when cardinality is low (tenant/account ids). For a
    /// high-cardinality Guid column prefer 16 raw bytes - see README.
    /// </summary>
    public static StringColumn<TRow> Guid<TRow>(string name, Func<TRow, Guid> get, Action<TRow, Guid> set)
        => new()
        {
            Name = name,
            Get = r => get(r).ToString("D"),
            Set = (r, v) => set(r, System.Guid.Parse(v!)),
        };

    public static BoolColumn<TRow> Bool<TRow>(string name, Func<TRow, bool> get, Action<TRow, bool> set)
        => new() { Name = name, Get = r => get(r), Set = (r, v) => set(r, v!.Value) };

    public static BoolColumn<TRow> BoolNull<TRow>(string name, Func<TRow, bool?> get, Action<TRow, bool?> set)
        => new() { Name = name, Get = get, Set = set };

    /// <summary>
    /// Enum as its small integer value - never as a string. A 6-value enum
    /// costs 1 byte here and ~12 in JSON.
    /// </summary>
    public static Int64Column<TRow> Enum<TRow, TEnum>(string name, Func<TRow, TEnum> get, Action<TRow, TEnum> set)
        where TEnum : struct, Enum
        => new()
        {
            Name = name,
            Get = r => Convert.ToInt64(get(r)),
            Set = (r, v) => set(r, (TEnum)System.Enum.ToObject(typeof(TEnum), v!.Value)),
        };

    public static DoubleColumn<TRow> Double<TRow>(string name, Func<TRow, double> get, Action<TRow, double> set)
        => new() { Name = name, Get = r => get(r), Set = (r, v) => set(r, v!.Value) };
}
