# Compressing a 170k-row payload: C# API → Blazor

Three strategies, measured rather than estimated, for moving ~170,000 rows of a
20-column SQL entity from a .NET 10 API to a Blazor front end.

## The headline finding

**You cannot get a full 170k × 20 payload down to "bytes". You can get every
load after the first one down to bytes.**

That distinction drives the whole design, so it is worth being blunt about.
Measured on a synthetic 170,000 × 20 dataset shaped like a real SQL projection:

| | size | vs JSON |
|---|---|---|
| JSON, uncompressed (the baseline today) | **67.55 MB** | 1× |
| JSON + gzip | 10.20 MB | 7× |
| JSON + Brotli q11 | 6.60 MB | 10× |
| Columnar + Brotli q5 | 4.46 MB | 15× |
| Columnar + Brotli q11 | **4.01 MB** | 17× |
| Delta: 500 rows changed | **18.2 KB** | 3,806× |
| Delta: 50 rows changed | 2.8 KB | 24,584× |
| Delta: nothing changed | **0 B** (HTTP 204) | — |

The best possible full-snapshot encoding lands at ~4 MB, not kilobytes. That is
not a codec limitation — it is the information content of the data. 170,000 rows
carrying ~200 bits of real entropy each is ~4 MB, and no encoder beats that
without throwing information away.

So the answer to "reduce the transmission packet to bytes instead of MB" is:
**stop sending the full dataset.** Send it once, then send only what changed.
That is Strategy 3, and it is the one that actually hits the goal.

### Before building any of this

The cheapest payload is the one you don't send. If the Blazor UI shows a grid,
a chart, or a filtered view, it does not need 170k rows — it needs a page of 50
or a pre-aggregated summary, which is a few KB with no custom codec at all.
Strategies below are for when the client genuinely needs the whole set locally
(offline work, instant client-side filtering/sorting across everything,
a local pivot). If it doesn't, server-side paging beats every option here.

---

## Strategy 1 — Transparent Brotli + schema slimming

Turn on response compression and make the JSON smaller before it gets
compressed. No client code at all: the browser advertises `Accept-Encoding`
and decodes the response itself, and Blazor's `HttpClient` rides on the
browser's fetch stack, so this works with zero changes on the Blazor side.

**Result: 67.55 MB → 6.60 MB (10×).** With short property names, 6.39 MB (11×).

What it buys: an order of magnitude for roughly an afternoon of work, applied
to your *entire* API rather than just this one endpoint.

The trap, and it is a serious one:

```
JSON + Brotli q11:   6.60 MB   but 158,232 ms to compress
JSON + Brotli q5:    9.30 MB          1,528 ms
```

**Brotli q11 over 67 MB takes over two and a half minutes.** You cannot do that
per request. Worse, `CompressionLevel` in .NET does not mean what it looks
like: for Brotli, `Optimal` is quality 4 and `SmallestSize` is quality 11 —
changed precisely because q11 is pathologically slow. So:

- per-request responses: `CompressionLevel.Optimal` (q4), live and cheap
- anything you can precompute and cache: `SmallestSize` (q11)

Implementation: `src/Wrightclick.Api/Program.cs`.

Also worth doing regardless of which strategy you pick, because it is nearly
free:

- `JsonIgnoreCondition.WhenWritingNull` — stop shipping `"notes":null` 170k times
- serialize enums as numbers, not names
- short property names via `[JsonPropertyName]`
- ETag + `304 Not Modified` so an unchanged refetch costs no body

**Verdict:** do this first, keep it forever, but it does not reach the goal.
6.6 MB is still megabytes, and the compression cost makes q11 unusable live.

---

## Strategy 2 — Columnar transform + Brotli

Stop sending rows. Transpose the payload into columns, encode each column with
a scheme suited to its contents, then Brotli the result.

**Result: 67.55 MB → 4.01 MB (17×) at q11, 4.46 MB (15×) at q5 in 206 ms.**

Why this beats compressing JSON, given both end in Brotli:

1. **Property names disappear.** 20 names × 170k rows of `"impressions":` is
   gone — each name is stored once, in the header.
2. **Like values become adjacent.** Brotli models context from nearby bytes. In
   row-oriented JSON, two `status` values are ~400 bytes apart with 19
   unrelated fields between them. Columnar puts them next to each other.
3. **Structural redundancy is removed before the entropy coder runs**, by a
   per-column encoding:

| encoding | for | effect |
|---|---|---|
| `Delta` | sequential ids, timestamps | `id` costs **2 bits/row** |
| `Dictionary` + bit-packed indices | enums, regions, tenant Guids | 6-value `status` → 3 bits/row |
| `BitSet` | bools | 1 bit/row |
| `Rle` | sorted/constant runs | near-free |
| `Varint` (zig-zag) | small or signed integers | 1–2 bytes instead of 8 |
| `Text` | free text | left for Brotli |

Encodings are chosen by an **exact cost model**, not thresholds: every
applicable encoding is measured and the smallest wins. This matters more than
it sounds. Threshold heuristics mispicked badly during development — a
400-value `accountId` column looked like free text and cost **296 bits/row**
until the cost model picked `Dictionary` instead (**9.7 bits/row**), and a
nullable `completedUtc` derived from another column isn't monotonic, so a
"delta if mostly ascending" rule left it on absolute timestamps at 6 bytes per
value instead of delta at ~3.

### Where the 4 MB actually goes

Per-column, each payload compressed on its own:

| column | encoding | brotli | bits/row | share |
|---|---|---|---|---|
| `title` | Text | 684.4 KB | 32.98 | 17.4% |
| `impressions` | Varint | 504.6 KB | 24.31 | 12.8% |
| `views` | Varint | 416.2 KB | 20.05 | 10.6% |
| `durationMs` | Varint | 393.3 KB | 18.95 | 10.0% |
| `clicks` | Varint | 286.3 KB | 13.79 | 7.3% |
| `score` | Delta | 268.8 KB | 12.95 | 6.8% |
| `cost` | Varint | 261.4 KB | 12.60 | 6.6% |
| `createdUtc` | Delta | 206.2 KB | 9.93 | 5.2% |
| `accountId` | Dictionary | 189.4 KB | 9.13 | 4.8% |
| `completedUtc` | Delta | 174.2 KB | 8.39 | 4.4% |
| `id` | Delta | 41.5 KB | 2.00 | 1.1% |
| `isDeleted` | BitSet | 6.3 KB | 0.30 | 0.2% |

This table is the important one. The structural columns are already
*essentially free* — `id` is 2 bits/row, the bools and enums round to nothing.
**Over half the payload is six high-entropy numeric columns** (impressions,
views, duration, clicks, score, cost), and one free-text column is another
17%. Those are measurement values; they are incompressible because they are
genuinely unpredictable.

Two consequences:

- Dropping both free-text columns only gets you from 4.01 MB to **3.10 MB**.
  There is no clever encoding left to find.
- The result barely moves on adversarial data. Regenerating every numeric
  column as wide uniform-random integers — near-maximum entropy — gives
  **4.87 MB vs 4.46 MB**. The floor is structural, not a quirk of the sample.

If you want the full payload materially smaller than this, the only levers left
are *sending less information*: drop columns the UI never reads, quantize
metrics you only ever render as a chart (`impressions` to 3 significant figures
is a large win and visually identical), or round timestamps you display to the
minute.

### Why this is cheap in Blazor specifically

The codec is one `net10.0` library referenced by **both** the API and the Blazor
client, so the encoder and decoder are literally the same code and cannot drift.
With a JavaScript front end you would write and maintain a second decoder by
hand — the single biggest cost of this approach, and Blazor removes it.

Implementation: `src/Wrightclick.Compression/` (`Primitives.cs`, `Columns.cs`,
`ColumnarSchema.cs`, `CjcSerializer.cs`). Schema: `JobRow.cs`.

**Verdict:** the right *format*, and worth it. But 4 MB is still MB — on its
own this does not meet the goal either.

---

## Strategy 3 — Delta sync (this is the one that gets to bytes)

Load the dataset once. After that, ask the server only for what changed.

**Result: 18.2 KB for 500 changed rows. 2.8 KB for 50. 0 bytes when nothing
changed.**

The client keeps a watermark — SQL Server's `rowversion`, which the database
bumps atomically on every insert and update:

```
GET /api/jobs/sync?since=48219

204 No Content                       ← nothing changed: no body at all
200 application/vnd.wrightclick.cjc  ← changed rows, columnar + Brotli
```

Use `rowversion`, not an `UpdatedUtc` column. Overlapping transactions can
write wall-clock timestamps out of order, and a delta query on a timestamp will
silently skip rows — a bug that shows up as a client that is quietly,
permanently wrong. The watermark is taken from `MIN_ACTIVE_ROWVERSION() - 1`,
below anything an open transaction could still commit, so no row can slip
between two syncs.

Three correctness problems this has to solve, because a stale local copy is
worse than a slow one:

**Deletes leave no row to find.** A `WHERE RowVer > @since` query cannot return
something that was removed, so deletions need a tombstone table. Delete ids are
sorted and delta-encoded on the wire, so a contiguous batch costs about a byte
each.

**Tombstones get pruned.** A client offline longer than the retention window
would merge a delta that silently omits deletions and keep phantom rows
forever. The server checks the oldest surviving tombstone against the client's
watermark and returns a full snapshot with `IsFullSnapshot` set instead of an
incorrect partial answer.

**Drift happens anyway** — a dropped response, a merge bug, a tab asleep
through a deletion. So the server can attach a **bucket digest**: the dataset
hashed into 256 buckets by primary key, order-independent so it doesn't depend
on SQL row order. The client hashes its own copy, compares, and refetches only
the buckets that disagree. A missed event costs kilobytes to repair instead of
a 67 MB refresh, and the client can *prove* it is in sync rather than assuming.

Implementation: `src/Wrightclick.Compression/DeltaSync.cs`,
`src/Wrightclick.Api/JobEndpoints.cs`, `src/Wrightclick.Client/JobDataStore.cs`.

**Verdict:** this is the strategy that answers the original question. It only
works on top of Strategy 2 — the initial load and the delta bodies both need a
compact format.

---

## Recommendation

They compose; ship them in this order.

1. **Strategy 1 now** (hours). Response compression, no nulls, numeric enums,
   ETags. 10× across the whole API, zero client code, nothing to maintain.
2. **Strategy 2 next** (days). The columnar codec as the format for this
   endpoint. Gets the unavoidable first load to ~4 MB and makes step 3
   worthwhile.
3. **Strategy 3 as the transport policy** (days). Snapshot once, then sync.
   This is what turns a 67 MB page load into a 0-byte one.

Steady state: **first load ~4 MB, every load after it 0 bytes to a few KB.**

Two operational notes:

- **Precompute the snapshot.** q11 costs ~15 s for the full set and
  milliseconds to decode. `SnapshotCache` builds it out of band and serves it
  from memory; per-request delta bodies use q5 (~200 ms, 10% larger).
- **Don't cache the payload in localStorage.** It holds ~5 MB of *strings*, so
  a 4 MB binary snapshot becomes ~5.4 MB of base64 and fails to store. Use
  IndexedDB — shim included at `src/Wrightclick.Client/wwwroot/payloadCache.js`.

### What I'd watch in Blazor WebAssembly

The payload is only half the latency story. Decoding 170k × 20 into 3.4M values
materializes 170,000 objects in WASM, and that is real time and real memory on
a mid-range phone. If the UI is a virtualized grid, consider keeping the data
**columnar** on the client — decode `title` and `status` for the visible 50
rows, leave the other columns as spans — rather than materializing entities you
then only read three fields from. That is a bigger win than another 10% off the
wire.

Also unverified here: I could not compile the C# in this environment (the .NET
SDK download is blocked by network policy), so the C# is reviewed but not
built. The wire format itself *is* verified — see below.

---

## Verifying it

`bench/cjc.mjs` is a portable reference implementation of the same wire format,
which is how the numbers above were produced and how the format is tested. It
also means a non-.NET client (mobile, Python, a JS admin tool) can be written
against a known-good implementation.

```bash
node compression/bench/test.mjs                      # 18 format/edge-case checks
node compression/bench/bench.mjs                     # full 170k measurement (~3 min)
node compression/bench/bench.mjs 170000 --skip-slow  # skip the 158 s q11 JSON pass
node compression/bench/bench.mjs 170000 --uniform    # adversarial numerics
```

The benchmark round-trips all 3,400,000 values and fails loudly on mismatch.

One caveat on the two implementations: the reference codec picks encodings by
trial-encoding each candidate, while the C# uses an equivalent closed-form cost
model (one pass, no allocation). They agree on every column in this dataset,
but a borderline column could in principle be encoded differently by each.
That is harmless — the chosen encoding is recorded per column in the frame, so
either side decodes the other's output correctly — but it means the byte counts
above are the reference implementation's, and the C# could differ marginally.

Edge cases covered: empty sets, all-null columns, non-byte-aligned bitmaps and
bitsets, single-value dictionaries (zero-width indices), int64-range and
negative values, unicode, and unknown-column skipping for forward
compatibility.

Numbers here are from a synthetic dataset with realistic cardinalities and
heavy-tailed, correlated metrics. **Re-run against real data before committing
to a design** — the ratio depends almost entirely on your own columns' entropy,
and the per-column table is the output to look at.

## Layout

```
compression/
  README.md
  bench/
    cjc.mjs            portable reference codec (measurement + conformance)
    bench.mjs          170k-row benchmark, per-column attribution
    test.mjs           edge cases
  src/
    Wrightclick.Compression/    shared by API and Blazor - one encoder/decoder
      Primitives.cs             varint, zig-zag, bit-packing
      Columns.cs                per-column encodings + cost model
      ColumnarSchema.cs         frame format, column factories
      CjcSerializer.cs          Brotli framing
      DeltaSync.cs              delta envelope, bucket digest
      JobRow.cs                 example 20-column entity + schema
    Wrightclick.Api/
      Program.cs                Strategy 1: response compression
      JobEndpoints.cs           snapshot / sync / repair
      JobStore.cs               rowversion queries, tombstones
      SnapshotCache.cs          precomputed q11 snapshot
    Wrightclick.Client/
      JobDataStore.cs           Blazor-side load, sync, repair
      IndexedDbPayloadCache.cs  warm start
      wwwroot/payloadCache.js
```

## Wire format (CJC v1)

```
magic        4 bytes "WCC1"
rowCount     uvarint
colCount     uvarint
per column:
  name       uvarint length + UTF-8
  encoding   u8
  nullable   u8   (1 => presence bitmap follows)
  [bitmap]   ceil(rowCount/8) bytes, bit set = value present
  payloadLen uvarint
  payload    only the present values
```

The frame is Brotli-compressed as a whole, outside the codec, so column
payloads stay byte-stable regardless of transport — which is what lets the
delta protocol's chunk hashes mean anything. Unknown columns are skipped on
decode, so the API can add a column before the client is redeployed.
