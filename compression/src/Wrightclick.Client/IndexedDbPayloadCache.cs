using Microsoft.JSInterop;

namespace Wrightclick.Client;

/// <summary>
/// <see cref="IPayloadCache"/> over IndexedDB.
///
/// Register in Program.cs:
///
///   builder.Services.AddScoped&lt;IPayloadCache, IndexedDbPayloadCache&gt;();
///   builder.Services.AddScoped&lt;JobDataStore&gt;();
///
/// Note the marshalling cost: byte[] crosses the JS boundary as a number
/// array, which for a multi-megabyte payload is not free. It is still far
/// cheaper than refetching, but it is the reason the snapshot is only
/// re-persisted when the local copy actually changed.
/// </summary>
public sealed class IndexedDbPayloadCache(IJSRuntime js) : IPayloadCache, IAsyncDisposable
{
    private IJSObjectReference? _module;

    private async ValueTask<IJSObjectReference> ModuleAsync()
        => _module ??= await js.InvokeAsync<IJSObjectReference>("import", "./payloadCache.js");

    public async ValueTask<byte[]?> GetAsync(string key)
    {
        var module = await ModuleAsync();
        return await module.InvokeAsync<byte[]?>("get", key);
    }

    public async ValueTask SetAsync(string key, byte[] payload)
    {
        var module = await ModuleAsync();
        await module.InvokeVoidAsync("set", key, payload);
    }

    public async ValueTask RemoveAsync(string key)
    {
        var module = await ModuleAsync();
        await module.InvokeVoidAsync("remove", key);
    }

    public async ValueTask DisposeAsync()
    {
        if (_module is not null) await _module.DisposeAsync();
    }
}
