using System.Buffers.Binary;
using System.Text;

namespace Wrightclick.Compression;

/// <summary>Growable little-endian / LEB128 byte writer.</summary>
public sealed class ByteWriter(int capacity = 64 * 1024)
{
    private byte[] _buf = new byte[capacity];
    private int _len;

    public int Length => _len;

    private void Ensure(int extra)
    {
        if (_len + extra <= _buf.Length) return;
        var cap = _buf.Length;
        while (cap < _len + extra) cap *= 2;
        Array.Resize(ref _buf, cap);
    }

    public void WriteU8(byte value)
    {
        Ensure(1);
        _buf[_len++] = value;
    }

    public void WriteUVarint(ulong value)
    {
        Ensure(10);
        while (value >= 0x80)
        {
            _buf[_len++] = (byte)((value & 0x7F) | 0x80);
            value >>= 7;
        }
        _buf[_len++] = (byte)value;
    }

    public void WriteSVarint(long value) => WriteUVarint(Zig(value));

    public void WriteDouble(double value)
    {
        Ensure(8);
        BinaryPrimitives.WriteDoubleLittleEndian(_buf.AsSpan(_len), value);
        _len += 8;
    }

    public void WriteBytes(ReadOnlySpan<byte> bytes)
    {
        Ensure(bytes.Length);
        bytes.CopyTo(_buf.AsSpan(_len));
        _len += bytes.Length;
    }

    /// <summary>Length-prefixed UTF-8.</summary>
    public void WriteString(string value)
    {
        var n = Encoding.UTF8.GetByteCount(value);
        WriteUVarint((ulong)n);
        Ensure(n);
        Encoding.UTF8.GetBytes(value, _buf.AsSpan(_len));
        _len += n;
    }

    public ReadOnlySpan<byte> Span => _buf.AsSpan(0, _len);
    public byte[] ToArray() => Span.ToArray();

    /// <summary>Zig-zag maps small negatives to small unsigned values.</summary>
    public static ulong Zig(long value) => (ulong)((value << 1) ^ (value >> 63));
    public static long Unzig(ulong value) => (long)(value >> 1) ^ -(long)(value & 1);

    /// <summary>Encoded length of a value, for the cost model - no allocation.</summary>
    public static int UVarintSize(ulong value)
    {
        var n = 1;
        while (value >= 0x80)
        {
            value >>= 7;
            n++;
        }
        return n;
    }

    public static int SVarintSize(long value) => UVarintSize(Zig(value));
}

/// <summary>Sequential reader over a frame. Mirrors <see cref="ByteWriter"/>.</summary>
public ref struct ByteReader(ReadOnlySpan<byte> buffer)
{
    private readonly ReadOnlySpan<byte> _buf = buffer;
    private int _p = 0;

    public int Position => _p;
    public bool AtEnd => _p >= _buf.Length;

    public byte ReadU8() => _buf[_p++];

    public ulong ReadUVarint()
    {
        ulong result = 0;
        var shift = 0;
        while (true)
        {
            var b = _buf[_p++];
            result |= (ulong)(b & 0x7F) << shift;
            if ((b & 0x80) == 0) return result;
            shift += 7;
            if (shift > 63) throw new InvalidDataException("varint overflow");
        }
    }

    public long ReadSVarint() => ByteWriter.Unzig(ReadUVarint());

    public double ReadDouble()
    {
        var v = BinaryPrimitives.ReadDoubleLittleEndian(_buf.Slice(_p, 8));
        _p += 8;
        return v;
    }

    public ReadOnlySpan<byte> Take(int count)
    {
        var s = _buf.Slice(_p, count);
        _p += count;
        return s;
    }

    public string ReadString() => Encoding.UTF8.GetString(Take((int)ReadUVarint()));
}

/// <summary>Packs fixed-width integers LSB-first within each byte.</summary>
public sealed class BitWriter
{
    private byte[] _buf = new byte[1024];
    private int _len;
    private int _bitCount;
    private byte _current;

    public void Write(uint value, int width)
    {
        for (var i = 0; i < width; i++)
        {
            if (((value >> i) & 1) != 0) _current |= (byte)(1 << _bitCount);
            if (++_bitCount != 8) continue;
            Append(_current);
            _current = 0;
            _bitCount = 0;
        }
    }

    private void Append(byte b)
    {
        if (_len == _buf.Length) Array.Resize(ref _buf, _buf.Length * 2);
        _buf[_len++] = b;
    }

    public ReadOnlySpan<byte> Finish()
    {
        if (_bitCount > 0)
        {
            Append(_current);
            _current = 0;
            _bitCount = 0;
        }
        return _buf.AsSpan(0, _len);
    }

    /// <summary>Bits needed to index <paramref name="count"/> distinct values.</summary>
    public static int BitsFor(int count) =>
        count <= 1 ? 0 : 32 - System.Numerics.BitOperations.LeadingZeroCount((uint)(count - 1));
}

public ref struct BitReader(ReadOnlySpan<byte> buffer)
{
    private readonly ReadOnlySpan<byte> _buf = buffer;
    private int _bit = 0;

    public uint Read(int width)
    {
        uint v = 0;
        for (var i = 0; i < width; i++)
        {
            if (((_buf[_bit >> 3] >> (_bit & 7)) & 1) != 0) v |= 1u << i;
            _bit++;
        }
        return v;
    }
}
