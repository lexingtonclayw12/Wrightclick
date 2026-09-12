using Dapper;
using Microsoft.Data.SqlClient;
using Wrightclick.Compression;

namespace Wrightclick.Api;

public readonly record struct DigestKey(long Id, long RowVersion);

public interface IJobStore
{
    Task<List<JobRow>> GetAllAsync(CancellationToken ct);
    Task<List<JobRow>> GetChangedSinceAsync(long watermark, CancellationToken ct);
    Task<List<long>> GetDeletedSinceAsync(long watermark, CancellationToken ct);
    Task<List<JobRow>> GetByBucketAsync(int[] buckets, int bucketCount, CancellationToken ct);
    Task<List<DigestKey>> GetDigestKeysAsync(CancellationToken ct);
    Task<long> GetCurrentWatermarkAsync(CancellationToken ct);
    Task<bool> CanServeIncrementallyAsync(long watermark, CancellationToken ct);
}

/// <summary>
/// SQL Server implementation built on <c>rowversion</c>, which the database
/// maintains atomically on every insert and update. That is what makes the
/// delta query correct under concurrency - a wall-clock UpdatedUtc column can
/// be written out of order by overlapping transactions and will silently skip
/// rows.
///
/// Required schema additions:
///
///   ALTER TABLE Jobs ADD RowVer rowversion NOT NULL;
///   CREATE INDEX IX_Jobs_RowVer ON Jobs(RowVer);
///
///   -- deletes leave no row behind, so they need a tombstone
///   CREATE TABLE JobDeletions (
///       Id      bigint     NOT NULL PRIMARY KEY,
///       RowVer  rowversion NOT NULL,
///       DeletedUtc datetime2 NOT NULL CONSTRAINT DF_JobDeletions_At DEFAULT SYSUTCDATETIME()
///   );
///   CREATE INDEX IX_JobDeletions_RowVer ON JobDeletions(RowVer);
///
/// Tombstones are pruned on a retention window (see
/// <see cref="CanServeIncrementallyAsync"/>); a client whose watermark predates
/// the window is sent a full snapshot instead of an incorrect partial one.
/// </summary>
public sealed class SqlJobStore(string connectionString) : IJobStore
{
    /// <summary>
    /// How long tombstones are kept. A client offline longer than this takes a
    /// full snapshot. Must match the pruning job's window.
    /// </summary>
    public static readonly TimeSpan TombstoneRetention = TimeSpan.FromDays(30);

    private const string SelectColumns = """
        SELECT  Id, AccountId, Status, Platform, Title, Notes,
                CreatedUtc, CompletedUtc, DurationMs, Cost, Score,
                IsActive, IsDeleted, Views, Impressions, Clicks,
                Region, ErrorCode, Version, Tags,
                CAST(RowVer AS bigint) AS RowVersion
        FROM    Jobs
        """;

    private async Task<SqlConnection> OpenAsync(CancellationToken ct)
    {
        var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(ct);
        return connection;
    }

    public async Task<List<JobRow>> GetAllAsync(CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        // Ordered by Id so the frame's delta-encoded key column stays cheap and
        // the payload is byte-identical across rebuilds (stable ETag).
        var rows = await db.QueryAsync<JobRow>(
            new CommandDefinition($"{SelectColumns} ORDER BY Id", cancellationToken: ct));
        return [.. rows];
    }

    public async Task<List<JobRow>> GetChangedSinceAsync(long watermark, CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        var rows = await db.QueryAsync<JobRow>(new CommandDefinition(
            $"{SelectColumns} WHERE CAST(RowVer AS bigint) > @watermark ORDER BY Id",
            new { watermark },
            cancellationToken: ct));
        return [.. rows];
    }

    public async Task<List<long>> GetDeletedSinceAsync(long watermark, CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        var ids = await db.QueryAsync<long>(new CommandDefinition(
            "SELECT Id FROM JobDeletions WHERE CAST(RowVer AS bigint) > @watermark ORDER BY Id",
            new { watermark },
            cancellationToken: ct));
        return [.. ids];
    }

    public async Task<List<JobRow>> GetByBucketAsync(int[] buckets, int bucketCount, CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        // Bucketing is Id % bucketCount, matching BucketDigest.Compute.
        var rows = await db.QueryAsync<JobRow>(new CommandDefinition(
            $"{SelectColumns} WHERE ABS(Id) % @bucketCount IN @buckets ORDER BY Id",
            new { bucketCount, buckets },
            cancellationToken: ct));
        return [.. rows];
    }

    public async Task<List<DigestKey>> GetDigestKeysAsync(CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        // Only two columns, so the digest can be recomputed cheaply and often.
        // Dapper maps these onto DigestKey's constructor by name.
        var keys = await db.QueryAsync<DigestKey>(new CommandDefinition(
            "SELECT Id, CAST(RowVer AS bigint) AS RowVersion FROM Jobs",
            cancellationToken: ct));
        return [.. keys];
    }

    public async Task<long> GetCurrentWatermarkAsync(CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        // MIN_ACTIVE_ROWVERSION is the lowest value an open transaction could
        // still commit. Taking the watermark below it guarantees no row is
        // skipped by a transaction that commits after this read.
        var value = await db.ExecuteScalarAsync<long>(new CommandDefinition(
            "SELECT CAST(MIN_ACTIVE_ROWVERSION() AS bigint) - 1", cancellationToken: ct));
        return Math.Max(value, 0);
    }

    public async Task<bool> CanServeIncrementallyAsync(long watermark, CancellationToken ct)
    {
        await using var db = await OpenAsync(ct);
        // If the oldest surviving tombstone is newer than the client's
        // watermark, deletions may have been pruned and an incremental answer
        // would leave phantom rows in the client's copy.
        var oldest = await db.ExecuteScalarAsync<long?>(new CommandDefinition(
            "SELECT MIN(CAST(RowVer AS bigint)) FROM JobDeletions", cancellationToken: ct));
        return oldest is null || oldest.Value <= watermark;
    }
}
