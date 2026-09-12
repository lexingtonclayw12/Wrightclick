// Measures every strategy in README.md against the same synthetic dataset:
// 170,000 rows x 20 columns, shaped like a SQL projection mapped to an entity.
//
//   node compression/bench/bench.mjs [rowCount] [--uniform]
//
// By default the numeric columns are heavy-tailed and correlated, which is how
// engagement metrics, durations and costs actually distribute in a SQL table.
// Pass --uniform to regenerate them as wide uniform-random integers instead:
// that is a deliberately adversarial dataset (near-maximum entropy, nothing
// for an entropy coder to find) and gives the pessimistic bound.

import zlib from "node:zlib";
import { encodeFrame, decodeFrame, encodingName } from "./cjc.mjs";

const args = process.argv.slice(2);
const UNIFORM = args.includes("--uniform");
// Brotli q11 over 67 MB of JSON takes ~2.5 minutes; skip it once measured.
const SKIP_SLOW = args.includes("--skip-slow");
const ROWS = Number(args.find((a) => !a.startsWith("--")) ?? 170_000);

// ---------------------------------------------------------------------------
// synthetic data
// ---------------------------------------------------------------------------

// Deterministic PRNG so successive runs are comparable.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20260912);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const int = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));

// Skewed pick - real status/platform columns are never uniform.
function skewed(a) {
  const r = rnd();
  const i = Math.floor(a.length * r * r);
  return a[Math.min(i, a.length - 1)];
}

const STATUSES = ["Completed", "Queued", "Processing", "Failed", "Cancelled", "Expired"];
const PLATFORMS = ["TikTok", "Instagram", "YouTube", "Facebook", "X"];
const REGIONS = ["us-east-1", "us-west-2", "eu-west-1", "eu-central-1", "ap-south-1", "ap-northeast-1", "sa-east-1", "ca-central-1"];
const ERRORS = ["RATE_LIMIT", "AUTH_EXPIRED", "MEDIA_TOO_LARGE", "UNSUPPORTED_CODEC", "UPSTREAM_5XX", "TIMEOUT", "QUOTA_EXCEEDED", "INVALID_ASPECT"];
const WORDS = ["launch", "promo", "reel", "teaser", "cutdown", "vertical", "hero", "brand", "spring", "summer", "holiday", "v2", "final", "review", "client", "draft", "ugc", "voiceover", "captions", "remix"];
const TAG_POOL = Array.from({ length: 60 }, () => [pick(WORDS), pick(WORDS)].join("|"));
const ACCOUNTS = Array.from({ length: 400 }, (_, i) =>
  `${(0x1f2e3d4c + i * 7919).toString(16).padStart(8, "0")}-4a1b-4c2d-8e3f-${(i * 104729).toString(16).padStart(12, "0").slice(-12)}`,
);

// Power-law-ish: most values small, a thin tail of large ones.
const heavy = (max, exp) => Math.floor(max * Math.pow(rnd(), exp));

function generate(count) {
  const rows = new Array(count);
  let id = 8_400_000;
  let created = Date.UTC(2025, 0, 1);
  for (let i = 0; i < count; i++) {
    const status = skewed(STATUSES);
    const failed = status === "Failed";

    // Realistic: render time tracks clip length; cost is billed off duration;
    // impressions dwarf views, and clicks are a small fraction of views.
    const duration = UNIFORM ? int(800, 900_000) : 800 + heavy(900_000, 2.6);
    const views = UNIFORM ? int(0, 2_000_000) : heavy(2_000_000, 3.2);
    const impressions = UNIFORM ? int(0, 40_000_000) : views * int(3, 25) + heavy(5_000, 2);
    const clicks = UNIFORM ? int(0, 90_000) : Math.floor(views * (rnd() * 0.04));
    const costCents = UNIFORM ? int(1, 250_000) : Math.ceil((duration / 1000) * 12);
    const scoreBp = UNIFORM ? int(0, 10_000) : 2_000 + Math.floor(((rnd() + rnd() + rnd()) / 3) * 8_000);

    created += int(1, 900); // arrival times: monotonic, small gaps
    rows[i] = {
      id: (id += int(1, 3)),
      accountId: pick(ACCOUNTS),
      status,
      platform: skewed(PLATFORMS),
      title: `${pick(WORDS)} ${pick(WORDS)} ${pick(WORDS)} ${int(1, 400)}`,
      notes: rnd() < 0.15 ? `${pick(WORDS)} ${pick(WORDS)} note ${int(1, 9999)}` : null,
      createdUtc: created,
      completedUtc: status === "Completed" ? created + duration : null,
      durationMs: duration,
      costCents,
      scoreBp, // score * 100, integer-quantized
      isActive: rnd() < 0.72,
      isDeleted: rnd() < 0.05,
      views,
      impressions,
      clicks,
      region: skewed(REGIONS),
      errorCode: failed || rnd() < 0.02 ? pick(ERRORS) : null,
      version: int(1, 20),
      tags: pick(TAG_POOL),
    };
  }
  return rows;
}

// One column descriptor per property; encoding is auto-selected from content.
const COLUMNS = Object.keys(generate(1)[0]).map((name) => ({ name, get: (r) => r[name] }));

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const br = (buf, quality) =>
  zlib.brotliCompressSync(buf, {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: quality,
      [zlib.constants.BROTLI_PARAM_LGWIN]: 24,
      [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length,
    },
  });
const gz = (buf) => zlib.gzipSync(buf, { level: 9 });

const fmt = (b) =>
  b >= 1 << 20 ? `${(b / 1048576).toFixed(2)} MB` : b >= 1024 ? `${(b / 1024).toFixed(1)} KB` : `${b} B`;

function time(label, fn) {
  const t0 = process.hrtime.bigint();
  const out = fn();
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  return { out, ms, label };
}

const results = [];
const record = (name, bytes, baseline, note) => {
  results.push({ name, bytes, baseline, note });
  return bytes;
};

// ---------------------------------------------------------------------------
// run
// ---------------------------------------------------------------------------

console.log(`\nGenerating ${ROWS.toLocaleString()} rows x ${COLUMNS.length} columns${UNIFORM ? " (uniform-random numerics: worst case)" : ""}...`);
const rows = generate(ROWS);

const json = Buffer.from(JSON.stringify(rows), "utf8");
const base = json.length;
record("1. JSON, uncompressed (today's baseline)", base, base);

console.log("Compressing (Brotli q11 over ~80 MB takes a moment)...\n");

record("2. JSON + gzip -9", time("gz", () => gz(json)).out.length, base);

const jsonBr5 = time("json-br5", () => br(json, 5));
record("3. JSON + Brotli q5 (live)", jsonBr5.out.length, base, `${jsonBr5.ms.toFixed(0)} ms`);

if (!SKIP_SLOW) {
  const jsonBr = time("json-br11", () => br(json, 11));
  record("4. JSON + Brotli q11  [Strategy 1]", jsonBr.out.length, base, `${jsonBr.ms.toFixed(0)} ms`);

  // Strategy 1 variant: shorten property names before compressing.
  const shortKeys = Object.fromEntries(COLUMNS.map((c, i) => [c.name, `k${i.toString(36)}`]));
  const shortJson = Buffer.from(
    JSON.stringify(rows.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [shortKeys[k], v])))),
    "utf8",
  );
  record("5. Short-key JSON + Brotli q11", br(shortJson, 11).length, base);
}

// Strategy 2: columnar frame.
const enc = time("cjc", () => encodeFrame(rows, COLUMNS));
const { frame, stats } = enc.out;
record("5. CJC columnar, uncompressed", frame.length, base, `${enc.ms.toFixed(0)} ms encode`);
const cjc5 = time("cjc-br5", () => br(frame, 5));
record("6. CJC + Brotli q5 (live requests)", cjc5.out.length, base, `${cjc5.ms.toFixed(0)} ms`);
let best = cjc5.out.length;
if (!SKIP_SLOW) {
  const cjc11 = time("cjc-br11", () => br(frame, 11));
  best = record("7. CJC + Brotli q11  [Strategy 2]", cjc11.out.length, base, `${cjc11.ms.toFixed(0)} ms`);
}

// What does the ratio actually hinge on? Re-encode without the free-text
// columns: if they dominate, no codec choice will move the number much.
const structural = COLUMNS.filter((c) => c.name !== "title" && c.name !== "notes");
const structuralFrame = encodeFrame(rows, structural).frame;
record("7b. CJC + Brotli, free text excluded", br(structuralFrame, 11).length, base, "18 columns");

// Strategy 3: delta sync - only rows whose version moved since the watermark.
for (const n of [500, 50]) {
  const changed = [];
  for (let i = 0; i < n; i++) changed.push(rows[int(0, ROWS - 1)]);
  changed.sort((a, b) => a.id - b.id);
  const d = encodeFrame(changed, COLUMNS).frame;
  record(`8. Delta: ${n} changed rows  [Strategy 3]`, br(d, 11).length, base);
}
record("9. Delta: no changes (HTTP 304 / 204)", 0, base, "headers only");

// ---------------------------------------------------------------------------
// correctness: the format is worthless if it does not round-trip
// ---------------------------------------------------------------------------

const decoded = decodeFrame(frame);
let mismatches = 0;
let firstBad = null;
for (let i = 0; i < rows.length; i++) {
  for (const c of COLUMNS) {
    const a = rows[i][c.name] ?? null;
    const b = decoded[i][c.name] ?? null;
    if (a !== b) {
      mismatches++;
      firstBad ??= `row ${i} col ${c.name}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`;
    }
  }
}

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------

const pad = Math.max(...results.map((r) => r.name.length));
console.log("=".repeat(pad + 36));
console.log(`${"strategy".padEnd(pad)}  ${"size".padStart(10)}  ${"vs JSON".padStart(9)}  note`);
console.log("=".repeat(pad + 36));
for (const r of results) {
  const ratio = r.bytes === 0 ? "infinite" : `${(r.baseline / r.bytes).toFixed(0)}x`;
  console.log(`${r.name.padEnd(pad)}  ${fmt(r.bytes).padStart(10)}  ${ratio.padStart(9)}  ${r.note ?? ""}`);
}
console.log("=".repeat(pad + 36));

console.log(`\nPer-row cost: JSON ${(base / ROWS).toFixed(0)} B  ->  CJC+Brotli ${((best / ROWS) * 8).toFixed(1)} bits`);
console.log(
  `Round-trip: ${mismatches === 0 ? `OK - ${(rows.length * COLUMNS.length).toLocaleString()} values identical` : `FAILED - ${mismatches} mismatches (${firstBad})`}`,
);

// Per-column compressed size, each payload Brotli'd on its own. Summing these
// slightly overshoots the real frame (compressing columns together finds
// cross-column redundancy), but it attributes the cost correctly.
console.log("\nColumn breakdown, largest compressed first:");
const colPad = Math.max(...stats.map((s) => s.name.length));
const attributed = stats
  .map((s) => ({ ...s, comp: br(s.payload, 11).length }))
  .sort((a, b) => b.comp - a.comp);
const attTotal = attributed.reduce((a, s) => a + s.comp, 0);

console.log(`  ${"column".padEnd(colPad)}  ${"enc".padEnd(6)}  ${"raw".padStart(9)}  ${"brotli".padStart(9)}  ${"bits/row".padStart(8)}  share`);
for (const s of attributed) {
  const bits = ((s.comp / ROWS) * 8).toFixed(2);
  const share = `${((s.comp / attTotal) * 100).toFixed(1)}%`;
  const nulls = s.nulls ? ` ${((s.nulls / ROWS) * 100).toFixed(0)}% null` : "";
  console.log(
    `  ${s.name.padEnd(colPad)}  ${encodingName(s.encoding).padEnd(6)}  ${fmt(s.bytes).padStart(9)}  ${fmt(s.comp).padStart(9)}  ${bits.padStart(8)}  ${share.padStart(5)}${nulls}`,
  );
}
console.log();

if (mismatches > 0) process.exit(1);
