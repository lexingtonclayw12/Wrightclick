using Wrightclick.Compression;

namespace Wrightclick.Api;

public static class JobEndpoints
{
    /// <summary>
    /// Custom media type so the Blazor client, browsers and proxies all treat
    /// the body as opaque binary. Do not use application/octet-stream: some
    /// intermediaries try to sniff or re-compress it.
    /// </summary>
    public const string CjcContentType = "application/vnd.wrightclick.cjc";

    public static RouteGroupBuilder MapJobEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/jobs");

        // --- Strategy 2: the full dataset, columnar + Brotli, precomputed ----
        //
        // Served from cache. Quality 11 over the whole table takes ~15 seconds,
        // so it is built on a schedule and on invalidation, never per request.
        group.MapGet("/snapshot", async (SnapshotCache cache, HttpContext http, CancellationToken ct) =>
        {
            var snapshot = await cache.GetAsync(ct);

            // A matching ETag makes the repeat cost zero bytes of body.
            var inm = http.Request.Headers.IfNoneMatch.ToString();
            if (inm == snapshot.ETag)
            {
                return Results.StatusCode(StatusCodes.Status304NotModified);
            }

            http.Response.Headers.ETag = snapshot.ETag;
            http.Response.Headers.CacheControl = "private, max-age=0, must-revalidate";
            http.Response.Headers["X-Watermark"] = snapshot.Watermark.ToString();
            return Results.Bytes(snapshot.Payload, CjcContentType);
        });

        // --- Strategy 3: everything that changed since the client's watermark -
        group.MapGet("/sync", async Task<IResult> (
            IJobStore store,
            HttpContext http,
            CancellationToken ct,
            long since = 0,
            bool digest = false) =>
        {
            var current = await store.GetCurrentWatermarkAsync(ct);

            // Nothing changed: the whole response is a status line and headers.
            // This is the steady state, and it is the only way the transfer is
            // measured in bytes rather than megabytes.
            if (current == since && !digest)
            {
                return Results.StatusCode(StatusCodes.Status204NoContent);
            }

            // A watermark the change log no longer covers cannot be answered
            // incrementally. Say so explicitly rather than silently returning a
            // partial set the client would merge into a corrupt local copy.
            if (since != 0 && !await store.CanServeIncrementallyAsync(since, ct))
            {
                var all = await store.GetAllAsync(ct);
                return Bytes(DeltaProtocol.Encode(JobRowSchema.Instance, new DeltaEnvelope<JobRow>
                {
                    Watermark = current,
                    Upserts = all,
                    IsFullSnapshot = true,
                }));
            }

            var changed = await store.GetChangedSinceAsync(since, ct);
            var deleted = await store.GetDeletedSinceAsync(since, ct);

            var envelope = new DeltaEnvelope<JobRow>
            {
                Watermark = current,
                Upserts = changed,
                DeletedIds = deleted,
                BucketDigest = digest
                    ? BucketDigest.Compute(await store.GetDigestKeysAsync(ct), k => k.Id, k => k.RowVersion)
                    : null,
            };

            http.Response.Headers["X-Watermark"] = current.ToString();
            return Bytes(DeltaProtocol.Encode(JobRowSchema.Instance, envelope));
        });

        // --- Strategy 3 repair path ------------------------------------------
        //
        // The client found a digest mismatch. Refetch only the divergent
        // buckets: a missed event costs kilobytes to repair, not 67 MB.
        group.MapPost("/repair", async Task<IResult> (
            int[] buckets,
            IJobStore store,
            CancellationToken ct) =>
        {
            if (buckets.Length == 0) return Results.BadRequest("no buckets requested");
            if (buckets.Length > BucketDigest.DefaultBucketCount) return Results.BadRequest("too many buckets");

            var rows = await store.GetByBucketAsync(buckets, BucketDigest.DefaultBucketCount, ct);
            return Bytes(DeltaProtocol.Encode(JobRowSchema.Instance, new DeltaEnvelope<JobRow>
            {
                Watermark = await store.GetCurrentWatermarkAsync(ct),
                Upserts = rows,
            }));
        });

        return group;
    }

    private static IResult Bytes(byte[] payload) => Results.Bytes(payload, CjcContentType);
}
