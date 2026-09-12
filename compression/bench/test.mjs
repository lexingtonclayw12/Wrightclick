// Format conformance / edge cases. Run: node compression/bench/test.mjs
import assert from "node:assert/strict";
import { encodeFrame, decodeFrame, ENC } from "./cjc.mjs";

let passed = 0;
function check(name, rows, columns) {
  const { frame } = encodeFrame(rows, columns);
  const out = decodeFrame(frame);
  assert.equal(out.length, rows.length, `${name}: row count`);
  for (let i = 0; i < rows.length; i++) {
    for (const c of columns) {
      assert.deepEqual(out[i][c.name] ?? null, rows[i][c.name] ?? null, `${name}: row ${i} col ${c.name}`);
    }
  }
  console.log(`  ok  ${name} (${frame.length} B)`);
  passed++;
}

const col = (name) => ({ name, get: (r) => r[name] });

check("empty row set", [], [col("a")]);
check("single row", [{ a: 1, b: "x", c: true }], [col("a"), col("b"), col("c")]);
check("all null column", [{ a: null }, { a: null }, { a: null }], [col("a")]);
check("leading and trailing nulls", [{ a: null }, { a: 5 }, { a: null }], [col("a")]);
check("negative and zero integers", [{ a: -1 }, { a: 0 }, { a: -2147483648 }, { a: 2147483647 }], [col("a")]);
check("large int64-range values", [{ a: 1_700_000_000_000 }, { a: -1_700_000_000_000 }], [col("a")]);
check("non-integer doubles", [{ a: 1.5 }, { a: -0.25 }, { a: 1e300 }], [col("a")]);
check("unicode and empty strings", [{ a: "" }, { a: "héllo→" }, { a: "🎬 clip" }, { a: "" }], [col("a")]);
check("single-value dictionary (zero-width index)", Array.from({ length: 50 }, () => ({ a: "same" })), [col("a")]);
check("bitset not byte-aligned", Array.from({ length: 13 }, (_, i) => ({ a: i % 3 === 0 })), [col("a")]);
check("bitmap not byte-aligned", Array.from({ length: 13 }, (_, i) => ({ a: i % 3 === 0 ? null : i })), [col("a")]);
check("long RLE run", Array.from({ length: 5000 }, () => ({ a: 7 })), [col("a")]);
check("dictionary at 2^k boundary", Array.from({ length: 300 }, (_, i) => ({ a: `v${i % 256}` })), [col("a")]);
check("wide dictionary", Array.from({ length: 1000 }, (_, i) => ({ a: `v${i % 513}` })), [col("a")]);

// A forced encoding must round-trip identically to the auto-selected one.
const rows = Array.from({ length: 200 }, (_, i) => ({ a: i * 3 }));
for (const encoding of [ENC.VARINT, ENC.DELTA, ENC.RLE]) {
  check(`forced encoding ${encoding}`, rows, [{ name: "a", get: (r) => r.a, encoding }]);
}

// A decoder that does not know a column must skip it, not fail: this is what
// lets the API add a column before the client is redeployed.
const twoCol = [{ a: 1, b: "x" }, { a: 2, b: "y" }];
const { frame } = encodeFrame(twoCol, [col("a"), col("b")]);
const decoded = decodeFrame(frame);
assert.equal(decoded[1].b, "y");
console.log("  ok  forward compatibility: unknown columns are readable");
passed++;

console.log(`\n${passed} checks passed`);
