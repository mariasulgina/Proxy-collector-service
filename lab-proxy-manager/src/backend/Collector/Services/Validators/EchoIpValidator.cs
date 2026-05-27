using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Collector.Services.Validators;

public class EchoIpValidator(LocalIpProvider localIpProvider, ILogger<EchoIpValidator> logger) : IProxyValidator
{
    public string TestUrl => "https://api.ipify.org?format=json";

    public async Task<bool> ValidateAsync(HttpResponseMessage response, CancellationToken token)
    {
        if (!response.IsSuccessStatusCode) return false;

        var body = await response.Content.ReadAsStringAsync(token);
        if (body.Length > 4096) return false;

        string? exitIp;
        try
        {
            using var doc = JsonDocument.Parse(body);
            exitIp = doc.RootElement.TryGetProperty("ip", out var ipProp) ? ipProp.GetString() : null;
        }
        catch (JsonException)
        {
            return false;
        }

        if (string.IsNullOrWhiteSpace(exitIp)) return false;

        var localIp = await localIpProvider.GetAsync(token);
        if (localIp is null)
        {
            logger.LogDebug("Local IP unknown, accepting proxy by syntactic check only");
            return true;
        }

        if (exitIp == localIp)
        {
            logger.LogDebug("Exit IP equals local IP — not a real proxy");
            return false;
        }

        return true;
    }
}
