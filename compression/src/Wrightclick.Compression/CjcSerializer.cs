using System.IO.Compression;

namespace Wrightclick.Compression;

/// <summary>
/// Brotli wrapper around <see cref="ColumnarSchema{TRow}"/>.
///
/// Payload layout: <c>[uvarint uncompressedLength][brotli bytes]</c>. The
/// length prefix lets the client allocate the exact output buffer and
/// decompress in one shot, which matters in Blazor WebAssembly where a
/// resizing MemoryStream costs real time.
///
/// A note on quality levels: <see cref="CompressionLevel"/> does not mean what
/// it looks like for Brotli. In modern .NET, <c>Optimal</c> maps to Brotli
/// quality 4 and <c>SmallestSize</c> to quality 11 - a change made because
/// quality 11 is roughly 50x slower to compress. That asymmetry is the whole
/// reason to precompute: use <see cref="Quality.Max"/> for snapshots you cache,
/// <see cref="Quality.Live"/> for per-request responses.
/// </summary>
public static class CjcSerializer
{
    public static class Quality
    {
        /// <summary>Per-request encoding. Single-digit ms for a delta payload.</summary>
        public const int Live = 5;

        /// <summary>Precomputed, cached snapshots. Slow to compress, same speed to read.</summary>
        public const int Max = 11;
    }

    /// <summary>
    /// Brotli window, as a power of two. 24 (16 MB) lets the encoder find
    /// matches across the whole of a large columnar frame; the default of 22
    /// costs a few percent on multi-megabyte input.
    /// </summary>
    public const int Window = 24;

    public static byte[] Serialize<TRow>(ColumnarSchema<TRow> schema, IReadOnlyList<TRow> rows, int quality = Quality.Live)
        => Compress(schema.Encode(rows), quality);

    public static List<TRow> Deserialize<TRow>(ColumnarSchema<TRow> schema, ReadOnlySpan<byte> payload)
        => schema.Decode(Decompress(payload));

    public static byte[] Compress(ReadOnlySpan<byte> frame, int quality = Quality.Live)
    {
        var prefix = new ByteWriter(16);
        prefix.WriteUVarint((ulong)frame.Length);

        var output = new byte[prefix.Length + BrotliEncoder.GetMaxCompressedLength(frame.Length)];
        prefix.Span.CopyTo(output);

        if (!BrotliEncoder.TryCompress(frame, output.AsSpan(prefix.Length), out var written, quality, Window))
        {
            throw new InvalidOperationException("Brotli compression failed");
        }

        Array.Resize(ref output, prefix.Length + written);
        return output;
    }

    public static byte[] Decompress(ReadOnlySpan<byte> payload)
    {
        var r = new ByteReader(payload);
        var length = (int)r.ReadUVarint();
        var body = payload[r.Position..];

        var frame = new byte[length];
        if (!BrotliDecoder.TryDecompress(body, frame, out var written) || written != length)
        {
            // Falls back to the streaming decoder, which handles payloads the
            // one-shot path rejects (multi-block streams from other encoders).
            using var input = new MemoryStream(body.ToArray());
            using var brotli = new BrotliStream(input, CompressionMode.Decompress);
            using var output = new MemoryStream(length);
            brotli.CopyTo(output);
            return output.ToArray();
        }
        return frame;
    }
}
