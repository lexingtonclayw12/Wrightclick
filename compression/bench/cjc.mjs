// CJC v1 ("Columnar JSON Codec") - reference implementation.
//
// This is the portable reference for the wire format that
// src/Wrightclick.Compression implements in C#. It exists so the format can be
// round-trip tested and measured without a .NET SDK, and so a non-.NET client
// (JS, Python, mobile) can be written against a known-good implementation.
//
// Frame layout (all integers little-endian / LEB128 where noted):
//
//   magic       4 bytes  "WCC1"
//   rowCount    uvarint
//   colCount    uvarint
//   per column:
//     nameLen   uvarint, then UTF-8 name
//     encoding  u8   (see ENC)
//     nullable  u8   (1 => a presence bitmap follows)
//     [bitmap]  ceil(rowCount/8) bytes, bit set = value PRESENT
//     payloadLen uvarint
//     payload   payloadLen bytes (only present values are encoded)
//
// The frame is then Brotli-compressed as a whole. Keeping compression outside
// the codec means the column payloads stay byte-identical regardless of
// transport, which is what makes chunk hashing in the delta protocol stable.

export const ENC = {
  VARINT: 1, // zigzag uvarint per value
  DELTA: 2, // first value zigzag, then zigzag deltas
  DICT: 3, // dictionary + bit-packed indices
  BITSET: 4, // 1 bit per value
  TEXT: 5, // length-prefixed UTF-8
  RLE: 6, // (value, runLength) pairs
  F64: 7, // raw IEEE-754 doubles
};

const ENC_NAME = Object.fromEntries(Object.entries(ENC).map(([k, v]) => [v, k]));
export const encodingName = (e) => ENC_NAME[e] ?? `UNKNOWN(${e})`;

// ---------------------------------------------------------------------------
// primitives
// ---------------------------------------------------------------------------

// Arithmetic rather than bitwise so values above 2^31 stay correct in JS.
// Safe for magnitudes below 2^53, which covers int64 columns in practice
// (epoch-ms timestamps, cents, impression counts).
const zigzag = (v) => (v >= 0 ? v * 2 : -v * 2 - 1);
const unzigzag = (u) => (u % 2 === 0 ? u / 2 : -(u + 1) / 2);

class ByteWriter {
  constructor() {
    this.buf = Buffer.alloc(1 << 16);
    this.len = 0;
  }
  #ensure(n) {
    if (this.len + n <= this.buf.length) return;
    let cap = this.buf.length;
    while (cap < this.len + n) cap *= 2;
    const next = Buffer.alloc(cap);
    this.buf.copy(next, 0, 0, this.len);
    this.buf = next;
  }
  u8(v) {
    this.#ensure(1);
    this.buf[this.len++] = v & 0xff;
  }
  uvarint(v) {
    this.#ensure(10);
    while (v >= 0x80) {
      this.buf[this.len++] = (v % 128) | 0x80;
      v = Math.floor(v / 128);
    }
    this.buf[this.len++] = v;
  }
  svarint(v) {
    this.uvarint(zigzag(v));
  }
  f64(v) {
    this.#ensure(8);
    this.buf.writeDoubleLE(v, this.len);
    this.len += 8;
  }
  bytes(b) {
    this.#ensure(b.length);
    b.copy(this.buf, this.len);
    this.len += b.length;
  }
  utf8(s) {
    const b = Buffer.from(s, "utf8");
    this.uvarint(b.length);
    this.bytes(b);
  }
  toBuffer() {
    return this.buf.subarray(0, this.len);
  }
}

class ByteReader {
  constructor(buf) {
    this.buf = buf;
    this.p = 0;
  }
  u8() {
    return this.buf[this.p++];
  }
  uvarint() {
    let result = 0;
    let scale = 1;
    let b;
    do {
      b = this.buf[this.p++];
      result += (b & 0x7f) * scale;
      scale *= 128;
    } while (b & 0x80);
    return result;
  }
  svarint() {
    return unzigzag(this.uvarint());
  }
  f64() {
    const v = this.buf.readDoubleLE(this.p);
    this.p += 8;
    return v;
  }
  take(n) {
    const b = this.buf.subarray(this.p, this.p + n);
    this.p += n;
    return b;
  }
  utf8() {
    return this.take(this.uvarint()).toString("utf8");
  }
}

// Bit-packing writes LSB-first inside each byte.
class BitWriter {
  constructor() {
    this.out = [];
    this.cur = 0;
    this.n = 0;
  }
  write(value, width) {
    for (let i = 0; i < width; i++) {
      if ((value >>> i) & 1) this.cur |= 1 << this.n;
      if (++this.n === 8) {
        this.out.push(this.cur);
        this.cur = 0;
        this.n = 0;
      }
    }
  }
  finish() {
    if (this.n > 0) this.out.push(this.cur);
    return Buffer.from(this.out);
  }
}

class BitReader {
  constructor(buf) {
    this.buf = buf;
    this.bit = 0;
  }
  read(width) {
    let v = 0;
    for (let i = 0; i < width; i++) {
      const byte = this.buf[this.bit >>> 3];
      if ((byte >>> (this.bit & 7)) & 1) v |= 1 << i;
      this.bit++;
    }
    return v;
  }
}

const bitsFor = (n) => (n <= 1 ? 0 : 32 - Math.clz32(n - 1));

// ---------------------------------------------------------------------------
// per-column encode / decode
// ---------------------------------------------------------------------------

function encodePayload(encoding, values) {
  const w = new ByteWriter();
  switch (encoding) {
    case ENC.VARINT:
      for (const v of values) w.svarint(v);
      break;

    case ENC.DELTA: {
      let prev = 0;
      for (const v of values) {
        w.svarint(v - prev);
        prev = v;
      }
      break;
    }

    case ENC.DICT: {
      const dict = [];
      const index = new Map();
      const ids = new Array(values.length);
      for (let i = 0; i < values.length; i++) {
        const key = values[i];
        let id = index.get(key);
        if (id === undefined) {
          id = dict.length;
          index.set(key, id);
          dict.push(key);
        }
        ids[i] = id;
      }
      w.uvarint(dict.length);
      for (const s of dict) w.utf8(s);
      const width = bitsFor(dict.length);
      const bw = new BitWriter();
      for (const id of ids) bw.write(id, width);
      w.bytes(bw.finish());
      break;
    }

    case ENC.BITSET: {
      const bw = new BitWriter();
      for (const v of values) bw.write(v ? 1 : 0, 1);
      w.bytes(bw.finish());
      break;
    }

    case ENC.TEXT:
      for (const v of values) w.utf8(v);
      break;

    case ENC.RLE: {
      const runs = [];
      for (const v of values) {
        const last = runs[runs.length - 1];
        if (last && last[0] === v) last[1]++;
        else runs.push([v, 1]);
      }
      w.uvarint(runs.length);
      for (const [v, n] of runs) {
        w.svarint(v);
        w.uvarint(n);
      }
      break;
    }

    case ENC.F64:
      for (const v of values) w.f64(v);
      break;

    default:
      throw new Error(`encode: unsupported encoding ${encoding}`);
  }
  return w.toBuffer();
}

function decodePayload(encoding, payload, count) {
  const r = new ByteReader(payload);
  const out = new Array(count);
  switch (encoding) {
    case ENC.VARINT:
      for (let i = 0; i < count; i++) out[i] = r.svarint();
      break;

    case ENC.DELTA: {
      let prev = 0;
      for (let i = 0; i < count; i++) {
        prev += r.svarint();
        out[i] = prev;
      }
      break;
    }

    case ENC.DICT: {
      const dictLen = r.uvarint();
      const dict = new Array(dictLen);
      for (let i = 0; i < dictLen; i++) dict[i] = r.utf8();
      const width = bitsFor(dictLen);
      const br = new BitReader(payload.subarray(r.p));
      for (let i = 0; i < count; i++) out[i] = dict[br.read(width)];
      break;
    }

    case ENC.BITSET: {
      const br = new BitReader(payload);
      for (let i = 0; i < count; i++) out[i] = br.read(1) === 1;
      break;
    }

    case ENC.TEXT:
      for (let i = 0; i < count; i++) out[i] = r.utf8();
      break;

    case ENC.RLE: {
      const runs = r.uvarint();
      let i = 0;
      for (let k = 0; k < runs; k++) {
        const v = r.svarint();
        const n = r.uvarint();
        for (let j = 0; j < n; j++) out[i++] = v;
      }
      break;
    }

    case ENC.F64:
      for (let i = 0; i < count; i++) out[i] = r.f64();
      break;

    default:
      throw new Error(`decode: unsupported encoding ${encoding}`);
  }
  return out;
}

// ---------------------------------------------------------------------------
// encoding selection
// ---------------------------------------------------------------------------

// Which encodings are even applicable to a column's runtime type.
function candidatesFor(present) {
  if (present.length === 0) return [ENC.VARINT];
  const sample = present[0];
  if (typeof sample === "boolean") return [ENC.BITSET];
  if (typeof sample === "number") {
    return present.every(Number.isInteger) ? [ENC.VARINT, ENC.DELTA, ENC.RLE] : [ENC.F64];
  }
  if (typeof sample === "string") return [ENC.DICT, ENC.TEXT];
  throw new Error(`unsupported column type: ${typeof sample}`);
}

// Encodes a column with every applicable encoding and keeps the smallest.
//
// Threshold heuristics ("delta if mostly ascending", "dictionary if under N
// distinct") mispick badly on real columns: a nullable timestamp derived from
// another column is not monotonic yet still halves under delta, and a 400-value
// account dictionary looks like free text at small row counts. Measuring is
// cheap relative to the Brotli pass that follows, and it cannot regress when
// the data shifts.
//
// Production pins the winner in the schema (ColumnEncoding.Auto -> explicit)
// so the hot path encodes once; re-measure when the data distribution changes.
export function encodeColumnBest(present) {
  let best = null;
  for (const encoding of candidatesFor(present)) {
    const payload = encodePayload(encoding, present);
    if (!best || payload.length < best.payload.length) best = { encoding, payload };
  }
  return best;
}

// ---------------------------------------------------------------------------
// frame encode / decode
// ---------------------------------------------------------------------------

const MAGIC = Buffer.from("WCC1", "ascii");

// columns: [{ name, get(row), encoding? }]
export function encodeFrame(rows, columns) {
  const w = new ByteWriter();
  w.bytes(MAGIC);
  w.uvarint(rows.length);
  w.uvarint(columns.length);

  const stats = [];
  for (const col of columns) {
    const raw = rows.map(col.get);
    const nullable = raw.some((v) => v === null || v === undefined);
    const present = nullable ? raw.filter((v) => v !== null && v !== undefined) : raw;

    // An explicit schema encoding skips the measurement pass.
    const chosen = col.encoding
      ? { encoding: col.encoding, payload: encodePayload(col.encoding, present) }
      : encodeColumnBest(present);
    const { encoding, payload } = chosen;

    w.utf8(col.name);
    w.u8(encoding);
    w.u8(nullable ? 1 : 0);

    let bitmapBytes = 0;
    if (nullable) {
      const bw = new BitWriter();
      for (const v of raw) bw.write(v === null || v === undefined ? 0 : 1, 1);
      const bitmap = bw.finish();
      bitmapBytes = bitmap.length;
      w.bytes(bitmap);
    }

    w.uvarint(payload.length);
    w.bytes(payload);

    stats.push({
      name: col.name,
      encoding,
      bytes: payload.length + bitmapBytes,
      nulls: raw.length - present.length,
      payload, // retained so callers can attribute compressed size per column
    });
  }
  return { frame: w.toBuffer(), stats };
}

export function decodeFrame(frame) {
  const r = new ByteReader(frame);
  if (!r.take(4).equals(MAGIC)) throw new Error("not a CJC frame");
  const rowCount = r.uvarint();
  const colCount = r.uvarint();

  const rows = Array.from({ length: rowCount }, () => ({}));
  for (let c = 0; c < colCount; c++) {
    const name = r.utf8();
    const encoding = r.u8();
    const nullable = r.u8() === 1;

    let presence = null;
    let count = rowCount;
    if (nullable) {
      const bitmap = r.take(Math.ceil(rowCount / 8));
      const br = new BitReader(bitmap);
      presence = new Array(rowCount);
      count = 0;
      for (let i = 0; i < rowCount; i++) {
        presence[i] = br.read(1) === 1;
        if (presence[i]) count++;
      }
    }

    const values = decodePayload(encoding, r.take(r.uvarint()), count);
    let k = 0;
    for (let i = 0; i < rowCount; i++) {
      rows[i][name] = !presence || presence[i] ? values[k++] : null;
    }
  }
  return rows;
}
