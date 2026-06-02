using System;
using System.Diagnostics;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Domain.Models;
using Microsoft.Extensions.Logging;

namespace Collector.Services;

public class ProxyChecker(ILogger<ProxyChecker> logger)
{
    public async Task<ProxyCheckResult> CheckAsync(
        Proxy proxy,
        string testUrl,
        TimeSpan timeout,
        CancellationToken ct)
    {
        try
        {
            var scheme = proxy.Protocol.Equals("SOCKS5", StringComparison.OrdinalIgnoreCase)
                ? "socks5"
                : "http";

            var webProxy = new WebProxy(new Uri($"{scheme}://{proxy.Ip}:{proxy.Port}"));

            using var handler = new SocketsHttpHandler
            {
                Proxy = webProxy,
                UseProxy = true,
                ConnectTimeout = timeout
            };

            using var client = new HttpClient(handler) { Timeout = timeout };

            var sw = Stopwatch.StartNew();
            using var response = await client.GetAsync(testUrl, ct);
            sw.Stop();

            if (response.IsSuccessStatusCode)
            {
                return new ProxyCheckResult(true, (int)sw.ElapsedMilliseconds);
            }

            logger.LogDebug("Proxy {Ip}:{Port} returned {Status}",
                proxy.Ip, proxy.Port, (int)response.StatusCode);
            return new ProxyCheckResult(false, 9999);
        }
        catch (Exception ex)
        {
            logger.LogDebug("Proxy {Ip}:{Port} failed: {Error}",
                proxy.Ip, proxy.Port, ex.Message);
            return new ProxyCheckResult(false, 9999);
        }
    }
}

public record ProxyCheckResult(bool Ok, int ResponseTimeMs);
