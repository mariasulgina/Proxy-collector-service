using Domain.Models;
using Domain.Repositories.Interfaces;
using WebServer.DTOs;
using WebServer.Services.Interfaces;
using WebServer.Mappings;

namespace WebServer.Services;

public class ProxyService(IProxyRepository repository) : IProxyService
{
    public async Task<PagedResult<ProxyDto>> GetPageAsync(
        int page, int pageSize, string? status, string? protocol)
    {
        var result = await repository.GetPageAsync(page, pageSize, status, protocol);

        return new PagedResult<ProxyDto>
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
}
