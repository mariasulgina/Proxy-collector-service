using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Collector.Services;

public class LocalIpProvider(ILogger<LocalIpProvider> logger)
{
    private string? _ip;
    private readonly SemaphoreSlim _lock = new(1, 1);

    public async Task<string?> GetAsync(CancellationToken token = default)
    {
        if (_ip is not null) return _ip;

        await _lock.WaitAsync(token);
        try
        {
            if (_ip is not null) return _ip;

            using var handler = new SocketsHttpHandler { UseProxy = false };
            using var client = new HttpClient(handler) { Timeout = TimeSpan.FromSeconds(5) };

            foreach (var url in new[] { "https://api.ipify.org?format=json", "https://ifconfig.me/all.json" })
            {
                try
                {
                    var json = await client.GetFromJsonAsync<IpEchoResponse>(url, token);
                    var ip = json?.Ip ?? json?.IpAddr;
                    if (!string.IsNullOrWhiteSpace(ip))
                    {
                        _ip = ip;
                        logger.LogInformation("Detected local external IP: {Ip}", _ip);
                        return _ip;
                    }
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Failed to get local IP from {Url}", url);
                }
            }

            logger.LogError("Could not determine local external IP. Echo-validation will be skipped — proxies will only be checked for connectivity.");
            return null;
        }
        finally
        {
            _lock.Release();
        }
    }

    private sealed record IpEchoResponse(string? Ip, string? IpAddr);
}
