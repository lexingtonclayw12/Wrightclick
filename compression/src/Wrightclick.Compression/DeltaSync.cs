using System.Buffers.Binary;

namespace Wrightclick.Compression;

/// <summary>
/// Strategy 3's wire envelope: only the rows that moved since the client's
/// watermark, plus the ids that were deleted, plus an optional digest the
/// client uses to prove it has not silently drifted.
///
/// This is the piece that actually gets a steady-state sync down to bytes. The
/// columnar codec makes the initial load small; only sending changes makes
/// every load after it nearly free.
/// </summary>
public sealed class DeltaEnvelope<TRow>
{
    /// <summary>New high-water mark. The client sends this back next time.</summary>
    public long Watermark { get; init; }

    /// <summary>Rows inserted or updated since the request watermark.</summary>
    public IReadOnlyList<TRow> Upserts { get; init; } = [];

    /// <summary>Primary keys deleted since the request watermark.</summary>
    public IReadOnlyList<long> DeletedIds { get; init; } = [];

    /// <summary>
    /// Per-bucket digest of the server's full dataset, when requested. Lets the
    /// client detect divergence without downloading anything.
    /// </summary>
    public ulong[]? BucketDigest { get; init; }

    /// <summary>
    /// Set when the server could not serve an incremental answer (watermark too
    /// old, retention window passed, schema changed). The client must discard
    /// local state and treat <see cref="Upserts"/> as the whole dataset.
    /// </summary>
    public bool IsFullSnapshot { get; init; }
}

public static class DeltaProtocol
{
    private static readonly byte[] Magic = "WCD1"u8.ToArray();

    private const byte FlagDigest = 1 << 0;
    private const byte FlagFullSnapshot = 1 << 1;

    /// <summary>
    /// Encodes an envelope and Brotli-compresses it. Delete ids are sorted and
    /// delta-encoded, so a run of contiguous deletions costs about a byte each.
    /// </summary>
    public static byte[] Encode<TRow>(ColumnarSchema<TRow> schema, DeltaEnvelope<TRow> envelope, int quality = CjcSerializer.Quality.Live)
    {
        var w = new ByteWriter();
        w.WriteBytes(Magic);

        byte flags = 0;
        if (envelope.BucketDigest is not null) flags |= FlagDigest;
        if (envelope.IsFullSnapshot) flags |= FlagFullSnapshot;
        w.WriteU8(flags);

        w.WriteUVarint((ulong)envelope.Watermark);

        var deleted = envelope.DeletedIds.Order().ToArray();
        w.WriteUVarint((ulong)deleted.Length);
        long previous = 0;
        foreach (var id in deleted)
        {
            w.WriteSVarint(unchecked(id - previous));
            previous = id;
        }

        if (envelope.BucketDigest is { } digest)
        {
            w.WriteUVarint((ulong)digest.Length);
            Span<byte> scratch = stackalloc byte[8];
            foreach (var hash in digest)
            {
                BinaryPrimitives.WriteUInt64LittleEndian(scratch, hash);
                w.WriteBytes(scratch);
            }
        }

        var frame = schema.Encode(envelope.Upserts);
        w.WriteUVarint((ulong)frame.Length);
        w.WriteBytes(frame);

        return CjcSerializer.Compress(w.Span, quality);
    }

    public static DeltaEnvelope<TRow> Decode<TRow>(ColumnarSchema<TRow> schema, ReadOnlySpan<byte> payload)
    {
        var body = CjcSerializer.Decompress(payload);
        var r = new ByteReader(body);
        if (!r.Take(4).SequenceEqual(Magic)) throw new InvalidDataException("not a delta envelope");

        var flags = r.ReadU8();
        var watermark = (long)r.ReadUVarint();

        var deletedCount = (int)r.ReadUVarint();
        var deleted = new long[deletedCount];
        long previous = 0;
        for (var i = 0; i < deletedCount; i++)
        {
            previous = unchecked(previous + r.ReadSVarint());
            deleted[i] = previous;
        }

        ulong[]? digest = null;
        if ((flags & FlagDigest) != 0)
        {
            digest = new ulong[(int)r.ReadUVarint()];
            for (var i = 0; i < digest.Length; i++) digest[i] = BinaryPrimitives.ReadUInt64LittleEndian(r.Take(8));
        }

        var frame = r.Take((int)r.ReadUVarint());

        return new DeltaEnvelope<TRow>
        {
            Watermark = watermark,
            Upserts = schema.Decode(frame),
            DeletedIds = deleted,
            BucketDigest = digest,
            IsFullSnapshot = (flags & FlagFullSnapshot) != 0,
        };
    }
}

/// <summary>
/// Order-independent digest of a dataset, bucketed by primary key.
///
/// The client computes the same digest over its local copy and compares. A
/// mismatch names the buckets that diverged, so the repair refetches one
/// bucket instead of the whole table - which is what keeps a missed webhook or
/// a botched merge from turning into an 80 MB refresh.
/// </summary>
public static class BucketDigest
{
    public const int DefaultBucketCount = 256;

    public static ulong[] Compute<TRow>(
        IEnumerable<TRow> rows,
        Func<TRow, long> id,
        Func<TRow, long> version,
        int bucketCount = DefaultBucketCount)
    {
        var buckets = new ulong[bucketCount];
        foreach (var row in rows)
        {
            var key = id(row);
            var bucket = (int)((ulong)key % (ulong)bucketCount);
            // XOR-combined so the digest does not depend on row order, which
            // SQL does not guarantee without an ORDER BY. Safe here because
            // (id, version) is unique per row, so no two terms can cancel.
            buckets[bucket] ^= Mix(unchecked((ulong)key * 0x9E3779B97F4A7C15UL) ^ (ulong)version(row));
        }
        return buckets;
    }

    /// <summary>Buckets where the two digests disagree, as bucket indices.</summary>
    public static int[] Divergent(ulong[] local, ulong[] remote)
    {
        if (local.Length != remote.Length)
        {
            // Different bucket counts are not comparable - force a full repair.
            return [.. Enumerable.Range(0, remote.Length)];
        }

        var divergent = new List<int>();
        for (var i = 0; i < local.Length; i++)
        {
            if (local[i] != remote[i]) divergent.Add(i);
        }
        return [.. divergent];
    }

    /// <summary>splitmix64 finaliser - cheap and avalanches well.</summary>
    private static ulong Mix(ulong z)
    {
        unchecked
        {
            z = (z ^ (z >> 30)) * 0xBF58476D1CE4E5B9UL;
            z = (z ^ (z >> 27)) * 0x94D049BB133111EBUL;
            return z ^ (z >> 31);
        }
    }
}
