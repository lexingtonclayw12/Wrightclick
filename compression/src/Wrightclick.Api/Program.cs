using System.IO.Compression;
using Microsoft.AspNetCore.ResponseCompression;
using Wrightclick.Api;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IJobStore>(_ =>
    new SqlJobStore(builder.Configuration.GetConnectionString("Jobs")
                    ?? throw new InvalidOperationException("ConnectionStrings:Jobs is not configured")));

builder.Services.AddSingleton<SnapshotCache>();
builder.Services.AddHostedService<SnapshotRefresher>();

// --- Strategy 1: transparent compression for everything else ---------------
//
// This covers the rest of the API for free - no client code at all, because
// the browser advertises Accept-Encoding and decodes the response itself. Note
// that CompressionLevel.Optimal is Brotli quality 4, not 11; that is the right
// trade for per-request work, and it is why the columnar endpoints precompress
// at quality 11 out of band instead.
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(["application/json"]);
});
builder.Services.Configure<BrotliCompressionProviderOptions>(o => o.Level = CompressionLevel.Optimal);
builder.Services.Configure<GzipCompressionProviderOptions>(o => o.Level = CompressionLevel.Optimal);

var app = builder.Build();

// Response compression must run before the endpoints that produce the body.
// The columnar endpoints set their own content type, which is not in MimeTypes,
// so their already-compressed payloads are not compressed a second time.
app.UseResponseCompression();

app.MapJobEndpoints();

app.Run();
