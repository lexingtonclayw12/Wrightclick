namespace Wrightclick.Compression;

public enum JobStatus
{
    Queued = 0,
    Processing = 1,
    Completed = 2,
    Failed = 3,
    Cancelled = 4,
    Expired = 5,
}

/// <summary>
/// Example entity: the 20-column SQL projection this codec was sized against.
/// Replace with the real entity - only <see cref="JobRowSchema"/> changes.
/// </summary>
public sealed class JobRow
{
    public long Id { get; set; }
    public Guid AccountId { get; set; }
    public JobStatus Status { get; set; }
    public string Platform { get; set; } = "";
    public string Title { get; set; } = "";
    public string? Notes { get; set; }
    public DateTime CreatedUtc { get; set; }
    public DateTime? CompletedUtc { get; set; }
    public int DurationMs { get; set; }
    public decimal Cost { get; set; }
    public double Score { get; set; }
    public bool IsActive { get; set; }
    public bool IsDeleted { get; set; }
    public int Views { get; set; }
    public long Impressions { get; set; }
    public int Clicks { get; set; }
    public string Region { get; set; } = "";
    public string? ErrorCode { get; set; }
    public int Version { get; set; }
    public string Tags { get; set; } = "";

    /// <summary>
    /// SQL <c>rowversion</c>, read as <c>CAST(RowVer AS bigint)</c>. Sync metadata, not
    /// payload - it drives the delta watermark and is not a transmitted column.
    /// </summary>
    public long RowVersion { get; set; }
}

public static class JobRowSchema
{
    /// <summary>
    /// Column order matters only for readability; the decoder matches on name.
    ///
    /// Encodings are left as Auto so a data-distribution change cannot silently
    /// inflate the payload. Once measured on production data, pin the winners
    /// (run the bench harness, then set ColumnEncoding explicitly) to skip the
    /// selection pass - it is roughly 15% of encode time.
    /// </summary>
    public static readonly ColumnarSchema<JobRow> Instance = new(
        [
            // Sequential key: delta encoding turns it into ~1 byte per row.
            Column.Int64<JobRow>("id", r => r.Id, (r, v) => r.Id = v),

            // Low-cardinality Guid: the dictionary stores each tenant once.
            Column.Guid<JobRow>("accountId", r => r.AccountId, (r, v) => r.AccountId = v),

            // Enums travel as integers, never as names.
            Column.Enum<JobRow, JobStatus>("status", r => r.Status, (r, v) => r.Status = v),

            Column.String<JobRow>("platform", r => r.Platform, (r, v) => r.Platform = v),

            // Free text: no structural win available, so it is handed to Brotli
            // as one contiguous run, which is the best thing that can be done
            // with it. This is normally the largest column in the frame.
            Column.String<JobRow>("title", r => r.Title, (r, v) => r.Title = v),
            Column.StringNull<JobRow>("notes", r => r.Notes, (r, v) => r.Notes = v),

            Column.DateTimeTicks<JobRow>("createdUtc", r => r.CreatedUtc, (r, v) => r.CreatedUtc = v),
            Column.DateTimeTicksNull<JobRow>("completedUtc", r => r.CompletedUtc, (r, v) => r.CompletedUtc = v),

            Column.Int32<JobRow>("durationMs", r => r.DurationMs, (r, v) => r.DurationMs = v),

            // decimal(18,2) as scaled cents.
            Column.Decimal<JobRow>("cost", r => r.Cost, (r, v) => r.Cost = v, scale: 2),

            // A double quantised to two decimals. Stored as an integer because a
            // raw double is a flat 8 bytes and resists entropy coding; two
            // decimal places of a 0-100 score fit in two varint bytes.
            new Int64Column<JobRow>
            {
                Name = "score",
                Get = r => (long)Math.Round(r.Score * 100),
                Set = (r, v) => r.Score = v!.Value / 100d,
            },

            Column.Bool<JobRow>("isActive", r => r.IsActive, (r, v) => r.IsActive = v),
            Column.Bool<JobRow>("isDeleted", r => r.IsDeleted, (r, v) => r.IsDeleted = v),

            Column.Int32<JobRow>("views", r => r.Views, (r, v) => r.Views = v),
            Column.Int64<JobRow>("impressions", r => r.Impressions, (r, v) => r.Impressions = v),
            Column.Int32<JobRow>("clicks", r => r.Clicks, (r, v) => r.Clicks = v),

            Column.String<JobRow>("region", r => r.Region, (r, v) => r.Region = v),
            Column.StringNull<JobRow>("errorCode", r => r.ErrorCode, (r, v) => r.ErrorCode = v),
            Column.Int32<JobRow>("version", r => r.Version, (r, v) => r.Version = v),
            Column.String<JobRow>("tags", r => r.Tags, (r, v) => r.Tags = v),
        ],
        () => new JobRow());
}
