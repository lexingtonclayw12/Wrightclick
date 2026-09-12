using System.Net.Http.Json;
using Wrightclick.Compression;

namespace Wrightclick.Client;

/// <summary>
/// Persistence for the client's cached payload.
///
/// Deliberately not localStorage: it holds ~5 MB per origin and only strings,
/// so a 4 MB binary payload becomes ~5.4 MB of base64 and fails to store. Use
/// IndexedDB or the Cache API, both of which take binary blobs and have a much
/// larger quota. See README for the JS shim.
/// </summary>
public interface IPayloadCache
{
    ValueTask<byte[]?> GetAsync(string key);
    ValueTask SetAsync(string key, byte[] payload);
    ValueTask RemoveAsync(string key);
}

/// <summary>Fallback that keeps the payload for the lifetime of the tab only.</summary>
public sealed class InMemoryPayloadCache : IPayloadCache
{
    private readonly Dictionary<string, byte[]> _entries = [];

    public ValueTask<byte[]?> GetAsync(string key)
        => ValueTask.FromResult(_entries.GetValueOrDefault(key));

    public ValueTask SetAsync(string key, byte[] payload)
    {
        _entries[key] = payload;
        return ValueTask.CompletedTask;
    }

    public ValueTask RemoveAsync(string key)
    {
        _entries.Remove(key);
        return ValueTask.CompletedTask;
    }
}

/// <summary>
/// Blazor-side dataset. Loads once, then stays current by applying deltas.
///
/// The decoder is the same <see cref="JobRowSchema"/> the API encodes with -
/// one assembly referenced by both projects, so the two halves cannot drift
/// out of sync. That is the main reason this design is cheaper in a Blazor app
/// than it would be with a JavaScript front end, where the decoder would have
/// to be written and maintained a second time.
/// </summary>
public sealed class JobDataStore(HttpClient http, IPayloadCache cache)
{
    private const string CacheKey = "jobs.snapshot.v1";
    private const string WatermarkKey = "jobs.watermark.v1";

    private readonly Dictionary<long, JobRow> _rows = [];

    public long Watermark { get; private set; }
    public int Count => _rows.Count;
    public IReadOnlyCollection<JobRow> Rows => _rows.Values;

    /// <summary>Raised after any change so the UI can re-render.</summary>
    public event Action? Changed;

    /// <summary>
    /// Warm start: decode the locally cached payload, then ask only for what
    /// changed since. A returning user transfers a few hundred bytes.
    /// </summary>
    public async Task InitializeAsync(CancellationToken ct = default)
    {
        var cached = await cache.GetAsync(CacheKey);
        if (cached is not null)
        {
            try
            {
                foreach (var row in CjcSerializer.Deserialize(JobRowSchema.Instance, cached))
                {
                    _rows[row.Id] = row;
                }
                Watermark = await ReadCachedWatermarkAsync();
            }
            catch (InvalidDataException)
            {
                // A payload written by an older format version. Drop it and
                // take a fresh snapshot rather than guessing.
                await cache.RemoveAsync(CacheKey);
                _rows.Clear();
                Watermark = 0;
            }
        }

        if (_rows.Count == 0) await LoadSnapshotAsync(ct);

        await SyncAsync(ct);
        Changed?.Invoke();
    }

    private async Task LoadSnapshotAsync(CancellationToken ct)
    {
        using var response = await http.GetAsync("api/jobs/snapshot", ct);
        response.EnsureSuccessStatusCode();

        var payload = await response.Content.ReadAsByteArrayAsync(ct);
        foreach (var row in CjcSerializer.Deserialize(JobRowSchema.Instance, payload))
        {
            _rows[row.Id] = row;
        }

        Watermark = response.Headers.TryGetValues("X-Watermark", out var values)
                    && long.TryParse(values.FirstOrDefault(), out var w)
            ? w
            : 0;

        await cache.SetAsync(CacheKey, payload);
        await WriteCachedWatermarkAsync(Watermark);
    }

    /// <summary>
    /// Pulls changes since the last watermark. Returns the number of rows
    /// touched; zero means the server answered 204 and sent no body at all.
    /// </summary>
    public async Task<int> SyncAsync(CancellationToken ct = default, bool withDigest = false)
    {
        var url = $"api/jobs/sync?since={Watermark}&digest={(withDigest ? "true" : "false")}";
        using var response = await http.GetAsync(url, ct);

        if (response.StatusCode == System.Net.HttpStatusCode.NoContent)
        {
            return 0;
        }
        response.EnsureSuccessStatusCode();

        var envelope = DeltaProtocol.Decode(
            JobRowSchema.Instance,
            await response.Content.ReadAsByteArrayAsync(ct));

        if (envelope.IsFullSnapshot) _rows.Clear();

        foreach (var row in envelope.Upserts) _rows[row.Id] = row;
        foreach (var id in envelope.DeletedIds) _rows.Remove(id);

        Watermark = envelope.Watermark;

        var touched = envelope.Upserts.Count + envelope.DeletedIds.Count;
        if (touched > 0)
        {
            // Re-persist so the next cold start is cheap again. Re-encoding
            // ~4 MB is slower than the delta itself, so only do it when the
            // local copy actually moved.
            await PersistAsync();
        }

        if (envelope.BucketDigest is { } digest) await RepairAsync(digest, ct);

        if (touched > 0) Changed?.Invoke();
        return touched;
    }

    /// <summary>
    /// Compares the server's digest against the local copy and refetches only
    /// the buckets that disagree. This is the guard against silent drift - a
    /// dropped delta, a merge bug, or a client that slept through a deletion.
    /// </summary>
    private async Task RepairAsync(ulong[] serverDigest, CancellationToken ct)
    {
        var local = BucketDigest.Compute(
            _rows.Values,
            r => r.Id,
            r => r.RowVersion,
            serverDigest.Length);

        var divergent = BucketDigest.Divergent(local, serverDigest);
        if (divergent.Length == 0) return;

        using var response = await http.PostAsJsonAsync("api/jobs/repair", divergent, ct);
        response.EnsureSuccessStatusCode();

        var envelope = DeltaProtocol.Decode(
            JobRowSchema.Instance,
            await response.Content.ReadAsByteArrayAsync(ct));

        // A repaired bucket is authoritative: drop what was there before so
        // rows the server no longer has do not survive locally.
        var repaired = divergent.ToHashSet();
        foreach (var id in _rows.Keys.Where(id => repaired.Contains((int)((ulong)id % (ulong)serverDigest.Length))).ToList())
        {
            _rows.Remove(id);
        }
        foreach (var row in envelope.Upserts) _rows[row.Id] = row;

        await PersistAsync();
        Changed?.Invoke();
    }

    private async Task PersistAsync()
    {
        var rows = _rows.Values.OrderBy(r => r.Id).ToList();
        await cache.SetAsync(
            CacheKey,
            CjcSerializer.Serialize(JobRowSchema.Instance, rows, CjcSerializer.Quality.Live));
        await WriteCachedWatermarkAsync(Watermark);
    }

    private async Task<long> ReadCachedWatermarkAsync()
    {
        var bytes = await cache.GetAsync(WatermarkKey);
        return bytes is { Length: 8 } ? BitConverter.ToInt64(bytes) : 0;
    }

    private ValueTask WriteCachedWatermarkAsync(long watermark)
        => cache.SetAsync(WatermarkKey, BitConverter.GetBytes(watermark));
}
