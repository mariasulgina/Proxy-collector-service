using System.Text;
using Domain.Models;
using Infrastructure.Repositories.Interfaces;
using WebServer.DTOs;
using WebServer.Mappings;
using WebServer.Services.Interfaces;

namespace WebServer.Services;

public class ProxyService(IProxyRepository repository) : IProxyService
{
    // Заголовок CSV-экспорта
    private const string CsvHeader = "id,ip,port,protocol,responseTimeMs,status,lastChecked";

    public async Task<PagedResultDto<ProxyDto>> GetPageAsync(
        int page, int pageSize, string? status, string? protocol)
    {
        var result = await repository.GetPageAsync(page, pageSize, status, protocol);

        return new PagedResultDto<ProxyDto>
        {
            Items = result.Items.Select(e => e.ToDto()).ToList(),
            TotalCount = result.TotalCount,
            Page = result.Page,
            PageSize = result.PageSize
        };
    }

    public async Task<ProxyDto?> GetByIdAsync(int id)
    {
        var proxy = await repository.GetByIdAsync(id);
        return proxy is null ? null : proxy.ToDto();
    }

    public async Task<ProxyDto> AddAsync(CreateProxyDto dto)
    {
        var proxy = new Proxy
        {
            Ip = dto.Ip,
            Port = dto.Port,
            Protocol = dto.Protocol,
            ResponseTimeMs = dto.ResponseTimeMs,
            LastChecked = DateTime.UtcNow
        };

        await repository.AddAsync(proxy);
        return proxy.ToDto();
    }

    public async Task<bool> DeleteAsync(int id) =>
        await repository.DeleteAsync(id);

    public async Task<CsvImportResultDto> ImportFromCsvAsync(IFormFile file)
    {
        var result = new CsvImportResultDto();
        var proxies = new List<Proxy>();

        using var reader = new StreamReader(file.OpenReadStream());
        var header = await reader.ReadLineAsync();

        if (header is null)
        {
            result.Errors.Add("Файл пустой.");
            return result;
        }

        // Определяем индексы колонок по заголовку
        var columns = header.Split(',').Select(c => c.Trim().ToLowerInvariant()).ToArray();
        var ipIdx       = Array.IndexOf(columns, "ip");
        var portIdx     = Array.IndexOf(columns, "port");
        var protocolIdx = Array.IndexOf(columns, "protocol");

        if (ipIdx == -1 || portIdx == -1)
        {
            result.Errors.Add("Заголовок CSV должен содержать колонки ip и port.");
            return result;
        }

        var lineNumber = 1;
        string? line;
        while ((line = await reader.ReadLineAsync()) is not null)
        {
            lineNumber++;
            if (string.IsNullOrWhiteSpace(line)) continue;

            var parts = line.Split(',');

            if (!TryParseProxyLine(parts, ipIdx, portIdx, protocolIdx, out var proxy, out var error))
            {
                result.Errors.Add($"Строка {lineNumber}: {error}");
                continue;
            }

            proxies.Add(proxy!);
        }

        if (proxies.Count > 0)
        {
            result.Imported = await repository.AddRangeAsync(proxies);
            result.Duplicates = proxies.Count - result.Imported;
        }

        return result;
    }

    private static bool TryParseProxyLine(
        string[] parts, int ipIdx, int portIdx, int protocolIdx,
        out Proxy? proxy, out string error)
    {
        proxy = null;
        var maxIdx = Math.Max(ipIdx, portIdx);
        if (parts.Length <= maxIdx)
        {
            error = "недостаточно колонок.";
            return false;
        }

        var ip = parts[ipIdx].Trim();
        if (string.IsNullOrEmpty(ip))
        {
            error = "IP не может быть пустым.";
            return false;
        }

        if (!int.TryParse(parts[portIdx].Trim(), out var port) || port is < 1 or > 65535)
        {
            error = $"некорректный порт: '{parts[portIdx].Trim()}'.";
            return false;
        }

        var protocol = protocolIdx >= 0 && parts.Length > protocolIdx
            ? parts[protocolIdx].Trim().ToUpperInvariant()
            : "HTTP";

        if (protocol is not ("HTTP" or "SOCKS5"))
            protocol = "HTTP";

        proxy = new Proxy
        {
            Ip = ip,
            Port = port,
            Protocol = protocol,
            ResponseTimeMs = 9999,
            LastChecked = DateTime.UtcNow
        };

        error = string.Empty;
        return true;
    }

    public async Task<int> DeleteRangeAsync(IReadOnlyList<int> ids) =>
        await repository.DeleteRangeAsync(ids);

    public async Task<string?> ExportByIdAsync(int id)
    {
        var proxy = await repository.GetByIdAsync(id);
        if (proxy is null) return null;

        var sb = new StringBuilder();
        sb.AppendLine(CsvHeader);
        AppendProxyCsvRow(sb, proxy.ToDto());
        return sb.ToString();
    }

    public async Task<string> ExportFilteredAsync(string? status, string? protocol)
    {
        var proxies = await repository.GetAllFilteredAsync(status, protocol);

        var sb = new StringBuilder();
        sb.AppendLine(CsvHeader);
        foreach (var p in proxies)
            AppendProxyCsvRow(sb, p.ToDto());

        return sb.ToString();
    }

    private static void AppendProxyCsvRow(StringBuilder sb, ProxyDto p) =>
        sb.AppendLine($"{p.Id},{p.Ip},{p.Port},{p.Protocol},{p.ResponseTimeMs},{p.Status},{p.LastChecked:O}");
}
