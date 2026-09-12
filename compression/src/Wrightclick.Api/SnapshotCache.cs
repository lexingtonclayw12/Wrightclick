using System.Security.Cryptography;
using Wrightclick.Compression;

namespace Wrightclick.Api;

public sealed record Snapshot(byte[] Payload, string ETag, long Watermark);

/// <summary>
/// Holds the precompressed full snapshot.
///
/// This exists because of a measured asymmetry: Brotli quality 11 over the
/// whole dataset takes ~15 seconds to compress and milliseconds to decompress.
/// Paying that per request is not an option; paying it once per change window
/// and serving the bytes from memory is. A 4 MB cached buffer is cheap.
/// </summary>
public sealed class SnapshotCache(IServiceScopeFactory scopes, ILogger<SnapshotCache> log)
{
    private readonly SemaphoreSlim _gate = new(1, 1);
    private volatile Snapshot? _current;

    public async Task<Snapshot> GetAsync(CancellationToken ct)
    {
        if (_current is { } cached) return cached;

        await _gate.WaitAsync(ct);
        try
        {
            // Another request may have built it while this one waited.
            if (_current is { } raced) return raced;
            _current = await BuildAsync(ct);
            return _current;
        }
        finally
        {
            _gate.Release();
        }
    }

    /// <summary>Call after a write batch; the next request rebuilds.</summary>
    public void Invalidate() => _current = null;

    public async Task RebuildAsync(CancellationToken ct)
    {
        await _gate.WaitAsync(ct);
        try
        {
            _current = await BuildAsync(ct);
        }
        finally
        {
            _gate.Release();
        }
    }

    private async Task<Snapshot> BuildAsync(CancellationToken ct)
    {
        using var scope = scopes.CreateScope();
        var store = scope.ServiceProvider.GetRequiredService<IJobStore>();

        // Read the watermark first. If rows change during the read, the
        // snapshot is merely stale rather than inconsistent, and the client's
        // next /sync call from this watermark picks the changes up.
        var watermark = await store.GetCurrentWatermarkAsync(ct);
        var rows = await store.GetAllAsync(ct);

        var started = TimeProvider.System.GetTimestamp();
        var payload = CjcSerializer.Serialize(JobRowSchema.Instance, rows, CjcSerializer.Quality.Max);
        var elapsed = TimeProvider.System.GetElapsedTime(started);

        var etag = $"\"{Convert.ToHexString(SHA256.HashData(payload))[..16]}\"";
        log.LogInformation(
            "Built job snapshot: {Rows} rows, {Bytes} bytes, watermark {Watermark}, in {Elapsed}",
            rows.Count, payload.Length, watermark, elapsed);

        return new Snapshot(payload, etag, watermark);
    }
}

/// <summary>
/// Keeps the snapshot warm. The interval is a staleness budget, not a
/// correctness one: a client always reconciles forward from the snapshot's
/// watermark via /sync, so a stale snapshot costs one slightly larger delta.
/// </summary>
public sealed class SnapshotRefresher(SnapshotCache cache, ILogger<SnapshotRefresher> log) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(15);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(Interval);
        do
        {
            try
            {
                await cache.RebuildAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                return;
            }
            catch (Exception ex)
            {
                // Keep serving the previous snapshot rather than failing reads.
                log.LogError(ex, "Snapshot rebuild failed; serving previous snapshot");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
