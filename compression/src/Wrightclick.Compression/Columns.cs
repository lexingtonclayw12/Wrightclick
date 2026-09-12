namespace Wrightclick.Compression;

/// <summary>
/// Per-column physical encoding. <see cref="Auto"/> measures every applicable
/// encoding and keeps the smallest; pin an explicit value once measured to skip
/// the selection pass on the hot path.
/// </summary>
public enum ColumnEncoding : byte
{
    Auto = 0,
    Varint = 1,
    Delta = 2,
    Dictionary = 3,
    BitSet = 4,
    Text = 5,
    Rle = 6,
    Float64 = 7,
}

public interface IColumn<TRow>
{
    string Name { get; }
    void Write(IReadOnlyList<TRow> rows, ByteWriter writer);
    void Read(TRow[] rows, ColumnEncoding encoding, bool[]? presence, ReadOnlySpan<byte> payload, int presentCount);
}

internal static class ColumnIo
{
    public static void WriteHeader<TRow>(ByteWriter w, IColumn<TRow> column, ColumnEncoding encoding, bool[]? presence, int rowCount)
    {
        w.WriteString(column.Name);
        w.WriteU8((byte)encoding);
        w.WriteU8(presence is null ? (byte)0 : (byte)1);
        if (presence is null) return;

        var bits = new BitWriter();
        for (var i = 0; i < rowCount; i++) bits.Write(presence[i] ? 1u : 0u, 1);
        w.WriteBytes(bits.Finish());
    }

    public static void WritePayload(ByteWriter w, ReadOnlySpan<byte> payload)
    {
        w.WriteUVarint((ulong)payload.Length);
        w.WriteBytes(payload);
    }

    /// <summary>Splits a nullable column into a presence map and the dense present values.</summary>
    public static bool[]? Presence<T>(T?[] raw) where T : struct
    {
        var hasNull = false;
        foreach (var v in raw)
        {
            if (v.HasValue) continue;
            hasNull = true;
            break;
        }
        if (!hasNull) return null;

        var presence = new bool[raw.Length];
        for (var i = 0; i < raw.Length; i++) presence[i] = raw[i].HasValue;
        return presence;
    }
}

// ---------------------------------------------------------------------------
// integers - the workhorse. Covers int/long/DateTime/decimal via projection.
// ---------------------------------------------------------------------------

public sealed class Int64Column<TRow> : IColumn<TRow>
{
    public required string Name { get; init; }
    public required Func<TRow, long?> Get { get; init; }
    public required Action<TRow, long?> Set { get; init; }
    public ColumnEncoding Encoding { get; init; } = ColumnEncoding.Auto;

    public void Write(IReadOnlyList<TRow> rows, ByteWriter w)
    {
        var n = rows.Count;
        var raw = new long?[n];
        for (var i = 0; i < n; i++) raw[i] = Get(rows[i]);

        var presence = ColumnIo.Presence(raw);
        var values = new long[n];
        var count = 0;
        foreach (var v in raw)
        {
            if (v.HasValue) values[count++] = v.Value;
        }

        var present = values.AsSpan(0, count);
        var encoding = Encoding == ColumnEncoding.Auto ? Choose(present) : Encoding;

        ColumnIo.WriteHeader(w, this, encoding, presence, n);
        var payload = new ByteWriter(Math.Max(64, count * 2));
        Encode(encoding, present, payload);
        ColumnIo.WritePayload(w, payload.Span);
    }

    /// <summary>
    /// Exact cost model. Sizes are computed arithmetically rather than by
    /// trial-encoding, so selection costs one pass and no allocation.
    /// </summary>
    private static ColumnEncoding Choose(ReadOnlySpan<long> v)
    {
        if (v.Length == 0) return ColumnEncoding.Varint;

        long varint = 0, delta = 0, rle = 0;
        long prev = 0, runValue = v[0];
        var runLength = 0;
        var runs = 0;

        for (var i = 0; i < v.Length; i++)
        {
            varint += ByteWriter.SVarintSize(v[i]);
            delta += ByteWriter.SVarintSize(unchecked(v[i] - prev));
            prev = v[i];

            if (v[i] == runValue)
            {
                runLength++;
            }
            else
            {
                rle += ByteWriter.SVarintSize(runValue) + ByteWriter.UVarintSize((ulong)runLength);
                runs++;
                runValue = v[i];
                runLength = 1;
            }
        }
        rle += ByteWriter.SVarintSize(runValue) + ByteWriter.UVarintSize((ulong)runLength);
        rle += ByteWriter.UVarintSize((ulong)(runs + 1)); // run-count prefix

        if (rle <= delta && rle <= varint) return ColumnEncoding.Rle;
        return delta <= varint ? ColumnEncoding.Delta : ColumnEncoding.Varint;
    }

    private static void Encode(ColumnEncoding encoding, ReadOnlySpan<long> v, ByteWriter w)
    {
        switch (encoding)
        {
            case ColumnEncoding.Varint:
                foreach (var x in v) w.WriteSVarint(x);
                break;

            case ColumnEncoding.Delta:
                long prev = 0;
                foreach (var x in v)
                {
                    w.WriteSVarint(unchecked(x - prev));
                    prev = x;
                }
                break;

            case ColumnEncoding.Rle:
                var runs = 0;
                for (var i = 0; i < v.Length; i++)
                {
                    if (i == 0 || v[i] != v[i - 1]) runs++;
                }
                w.WriteUVarint((ulong)runs);
                for (var i = 0; i < v.Length;)
                {
                    var j = i;
                    while (j < v.Length && v[j] == v[i]) j++;
                    w.WriteSVarint(v[i]);
                    w.WriteUVarint((ulong)(j - i));
                    i = j;
                }
                break;

            default:
                throw new InvalidDataException($"{encoding} is not valid for an integer column");
        }
    }

    public void Read(TRow[] rows, ColumnEncoding encoding, bool[]? presence, ReadOnlySpan<byte> payload, int presentCount)
    {
        var values = new long[presentCount];
        var r = new ByteReader(payload);

        switch (encoding)
        {
            case ColumnEncoding.Varint:
                for (var i = 0; i < presentCount; i++) values[i] = r.ReadSVarint();
                break;

            case ColumnEncoding.Delta:
                long prev = 0;
                for (var i = 0; i < presentCount; i++)
                {
                    prev = unchecked(prev + r.ReadSVarint());
                    values[i] = prev;
                }
                break;

            case ColumnEncoding.Rle:
                var runs = (int)r.ReadUVarint();
                var k = 0;
                for (var run = 0; run < runs; run++)
                {
                    var value = r.ReadSVarint();
                    var length = (int)r.ReadUVarint();
                    for (var j = 0; j < length; j++) values[k++] = value;
                }
                break;

            default:
                throw new InvalidDataException($"{encoding} is not valid for an integer column");
        }

        var next = 0;
        for (var i = 0; i < rows.Length; i++)
        {
            Set(rows[i], presence is null || presence[i] ? values[next++] : null);
        }
    }
}

// ---------------------------------------------------------------------------
// strings
// ---------------------------------------------------------------------------

public sealed class StringColumn<TRow> : IColumn<TRow>
{
    public required string Name { get; init; }
    public required Func<TRow, string?> Get { get; init; }
    public required Action<TRow, string?> Set { get; init; }
    public ColumnEncoding Encoding { get; init; } = ColumnEncoding.Auto;

    public void Write(IReadOnlyList<TRow> rows, ByteWriter w)
    {
        var n = rows.Count;
        var raw = new string?[n];
        var hasNull = false;
        for (var i = 0; i < n; i++)
        {
            raw[i] = Get(rows[i]);
            hasNull |= raw[i] is null;
        }

        bool[]? presence = null;
        if (hasNull)
        {
            presence = new bool[n];
            for (var i = 0; i < n; i++) presence[i] = raw[i] is not null;
        }

        var present = new List<string>(n);
        foreach (var s in raw)
        {
            if (s is not null) present.Add(s);
        }

        var encoding = Encoding == ColumnEncoding.Auto ? Choose(present) : Encoding;
        ColumnIo.WriteHeader(w, this, encoding, presence, n);

        var payload = new ByteWriter(Math.Max(64, present.Count * 4));
        if (encoding == ColumnEncoding.Text)
        {
            foreach (var s in present) payload.WriteString(s);
        }
        else
        {
            var dictionary = new List<string>();
            var index = new Dictionary<string, int>(StringComparer.Ordinal);
            var ids = new int[present.Count];
            for (var i = 0; i < present.Count; i++)
            {
                if (!index.TryGetValue(present[i], out var id))
                {
                    id = dictionary.Count;
                    index[present[i]] = id;
                    dictionary.Add(present[i]);
                }
                ids[i] = id;
            }

            payload.WriteUVarint((ulong)dictionary.Count);
            foreach (var s in dictionary) payload.WriteString(s);

            var width = BitWriter.BitsFor(dictionary.Count);
            var bits = new BitWriter();
            foreach (var id in ids) bits.Write((uint)id, width);
            payload.WriteBytes(bits.Finish());
        }

        ColumnIo.WritePayload(w, payload.Span);
    }

    /// <summary>
    /// Dictionary beats inline text as soon as the shared prefix of repeated
    /// values outweighs the index bits. Measured, not thresholded: a
    /// 400-value account-id column and a free-text title column land on
    /// opposite sides and no fixed cutoff separates them reliably.
    /// </summary>
    private static ColumnEncoding Choose(List<string> values)
    {
        if (values.Count == 0) return ColumnEncoding.Text;

        long text = 0;
        var distinct = new Dictionary<string, int>(StringComparer.Ordinal);
        long dictionaryBytes = 0;

        foreach (var s in values)
        {
            var bytes = System.Text.Encoding.UTF8.GetByteCount(s);
            text += ByteWriter.UVarintSize((ulong)bytes) + bytes;
            if (distinct.TryAdd(s, distinct.Count))
            {
                dictionaryBytes += ByteWriter.UVarintSize((ulong)bytes) + bytes;
            }
        }

        var width = BitWriter.BitsFor(distinct.Count);
        var dict = dictionaryBytes
                   + ByteWriter.UVarintSize((ulong)distinct.Count)
                   + (values.Count * (long)width + 7) / 8;

        return dict < text ? ColumnEncoding.Dictionary : ColumnEncoding.Text;
    }

    public void Read(TRow[] rows, ColumnEncoding encoding, bool[]? presence, ReadOnlySpan<byte> payload, int presentCount)
    {
        var values = new string[presentCount];
        var r = new ByteReader(payload);

        if (encoding == ColumnEncoding.Text)
        {
            for (var i = 0; i < presentCount; i++) values[i] = r.ReadString();
        }
        else if (encoding == ColumnEncoding.Dictionary)
        {
            var dictionaryLength = (int)r.ReadUVarint();
            var dictionary = new string[dictionaryLength];
            for (var i = 0; i < dictionaryLength; i++) dictionary[i] = r.ReadString();

            var width = BitWriter.BitsFor(dictionaryLength);
            var bits = new BitReader(payload[r.Position..]);
            for (var i = 0; i < presentCount; i++) values[i] = dictionary[bits.Read(width)];
        }
        else
        {
            throw new InvalidDataException($"{encoding} is not valid for a string column");
        }

        var next = 0;
        for (var i = 0; i < rows.Length; i++)
        {
            Set(rows[i], presence is null || presence[i] ? values[next++] : null);
        }
    }
}

// ---------------------------------------------------------------------------
// booleans and floats
// ---------------------------------------------------------------------------

public sealed class BoolColumn<TRow> : IColumn<TRow>
{
    public required string Name { get; init; }
    public required Func<TRow, bool?> Get { get; init; }
    public required Action<TRow, bool?> Set { get; init; }

    public void Write(IReadOnlyList<TRow> rows, ByteWriter w)
    {
        var n = rows.Count;
        var raw = new bool?[n];
        for (var i = 0; i < n; i++) raw[i] = Get(rows[i]);

        var presence = ColumnIo.Presence(raw);
        ColumnIo.WriteHeader(w, this, ColumnEncoding.BitSet, presence, n);

        var bits = new BitWriter();
        foreach (var v in raw)
        {
            if (v.HasValue) bits.Write(v.Value ? 1u : 0u, 1);
        }

        var payload = new ByteWriter(64);
        payload.WriteBytes(bits.Finish());
        ColumnIo.WritePayload(w, payload.Span);
    }

    public void Read(TRow[] rows, ColumnEncoding encoding, bool[]? presence, ReadOnlySpan<byte> payload, int presentCount)
    {
        if (encoding != ColumnEncoding.BitSet) throw new InvalidDataException($"{encoding} is not valid for a bool column");

        var bits = new BitReader(payload);
        var values = new bool[presentCount];
        for (var i = 0; i < presentCount; i++) values[i] = bits.Read(1) == 1;

        var next = 0;
        for (var i = 0; i < rows.Length; i++)
        {
            Set(rows[i], presence is null || presence[i] ? values[next++] : null);
        }
    }
}

/// <summary>
/// Raw IEEE-754. Prefer quantising to an <see cref="Int64Column{TRow}"/> where
/// the precision is not needed - a double costs a flat 8 bytes and resists
/// entropy coding, while the same value scaled to an integer often costs 1-2.
/// </summary>
public sealed class DoubleColumn<TRow> : IColumn<TRow>
{
    public required string Name { get; init; }
    public required Func<TRow, double?> Get { get; init; }
    public required Action<TRow, double?> Set { get; init; }

    public void Write(IReadOnlyList<TRow> rows, ByteWriter w)
    {
        var n = rows.Count;
        var raw = new double?[n];
        for (var i = 0; i < n; i++) raw[i] = Get(rows[i]);

        var presence = ColumnIo.Presence(raw);
        ColumnIo.WriteHeader(w, this, ColumnEncoding.Float64, presence, n);

        var payload = new ByteWriter(Math.Max(64, n * 8));
        foreach (var v in raw)
        {
            if (v.HasValue) payload.WriteDouble(v.Value);
        }
        ColumnIo.WritePayload(w, payload.Span);
    }

    public void Read(TRow[] rows, ColumnEncoding encoding, bool[]? presence, ReadOnlySpan<byte> payload, int presentCount)
    {
        if (encoding != ColumnEncoding.Float64) throw new InvalidDataException($"{encoding} is not valid for a double column");

        var r = new ByteReader(payload);
        var values = new double[presentCount];
        for (var i = 0; i < presentCount; i++) values[i] = r.ReadDouble();

        var next = 0;
        for (var i = 0; i < rows.Length; i++)
        {
            Set(rows[i], presence is null || presence[i] ? values[next++] : null);
        }
    }
}
