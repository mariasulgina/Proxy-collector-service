using WebServer.DTOs;

namespace WebServer.Services.Interfaces;

public interface IProxyService
{
    Task<PagedResultDto<ProxyDto>> GetPageAsync(int page, int pageSize, string? status, string? protocol);
    Task<ProxyDto?> GetByIdAsync(int id);
    Task<ProxyDto> AddAsync(CreateProxyDto dto);
    Task<bool> DeleteAsync(int id);
}
