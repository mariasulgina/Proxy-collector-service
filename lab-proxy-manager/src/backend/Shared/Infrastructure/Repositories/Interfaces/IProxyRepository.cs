using System.Threading.Tasks;
using Domain.Models;

namespace Infrastructure.Repositories.Interfaces;

public interface IProxyRepository
{
    Task<PagedResult<Proxy>> GetPageAsync(int page, int pageSize, string? status, string? protocol);
    Task<IEnumerable<Proxy>> GetAllFilteredAsync(string? status, string? protocol);
    Task<Proxy?> GetByIdAsync(int id);
    Task AddAsync(Proxy proxy);
    Task<int> AddRangeAsync(IEnumerable<Proxy> proxies);
    Task UpdateAsync(Proxy proxy);
    Task<bool> DeleteAsync(int id);
    Task<int> DeleteRangeAsync(IEnumerable<int> ids);
}
