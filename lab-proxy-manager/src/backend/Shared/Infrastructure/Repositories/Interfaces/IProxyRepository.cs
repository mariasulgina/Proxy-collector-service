using System.Threading.Tasks;
using Domain.Models;

namespace Infrastructure.Repositories.Interfaces;

public interface IProxyRepository
{
    Task<PagedResult<Proxy>> GetPageAsync(int page, int pageSize, string? status, string? protocol);
    Task<Proxy?> GetByIdAsync(int id);
    Task AddAsync(Proxy proxy);
    Task UpdateAsync(Proxy proxy);
    Task<bool> DeleteAsync(int id);
}
