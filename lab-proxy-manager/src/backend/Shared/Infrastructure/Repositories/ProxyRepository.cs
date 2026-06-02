using System.Linq;
using System.Threading.Tasks;
using Domain.Models;
using Domain.Exceptions;
using Infrastructure.Repositories.Interfaces;
using Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Infrastructure.Repositories;

public class ProxyRepository(AppDbContext db) : IProxyRepository
{
    public async Task UpdateAsync(Proxy proxy)
    {
        db.Proxies.Update(proxy);
        await db.SaveChangesAsync();
    }

    public async Task<PagedResult<Proxy>> GetPageAsync(int page, int pageSize, string? status, string? protocol)
    {
        var query = BuildFilteredQuery(status, protocol);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(p => p.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<Proxy>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<IEnumerable<Proxy>> GetAllFilteredAsync(string? status, string? protocol)
        => await BuildFilteredQuery(status, protocol)
            .OrderBy(p => p.Id)
            .ToListAsync();

    public async Task<Proxy?> GetByIdAsync(int id) =>
        await db.Proxies.FindAsync(id);

    public async Task AddAsync(Proxy proxy)
    {
        db.Proxies.Add(proxy);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: "23505" })
        {
            db.Entry(proxy).State = EntityState.Detached;
            throw new DuplicateProxyException(proxy.Ip, proxy.Port);
        }
    }

    /// <summary>
    /// Добавляет список прокси, пропуская дубликаты.
    /// Возвращает количество реально добавленных записей.
    /// </summary>
    public async Task<int> AddRangeAsync(IEnumerable<Proxy> proxies)
    {
        var added = 0;
        foreach (var proxy in proxies)
        {
            try
            {
                await AddAsync(proxy);
                added++;
            }
            catch (DuplicateProxyException)
            {
                // пропускаем дубликат, продолжаем
            }
        }
        return added;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var proxy = await db.Proxies.FindAsync(id);
        if (proxy is null) return false;

        db.Proxies.Remove(proxy);
        await db.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Удаляет прокси по списку ID одним запросом.
    /// Возвращает количество удалённых записей.
    /// </summary>
    public async Task<int> DeleteRangeAsync(IEnumerable<int> ids)
    {
        var idList = ids.ToList();
        return await db.Proxies
            .Where(p => idList.Contains(p.Id))
            .ExecuteDeleteAsync();
    }

    // Выносим общую логику фильтрации, чтобы не дублировать её
    // в GetPageAsync и GetAllFilteredAsync
    private IQueryable<Proxy> BuildFilteredQuery(string? status, string? protocol)
    {
        var query = db.Proxies.AsQueryable();

        if (!string.IsNullOrEmpty(protocol))
            query = query.Where(p => p.Protocol == protocol);

        if (!string.IsNullOrEmpty(status))
        {
            query = status switch
            {
                "Good"          => query.Where(p => p.ResponseTimeMs < 200),
                "Normal"        => query.Where(p => p.ResponseTimeMs >= 200 && p.ResponseTimeMs <= 500),
                "Bad"           => query.Where(p => p.ResponseTimeMs > 500 && p.ResponseTimeMs < 5000),
                "No connection" => query.Where(p => p.ResponseTimeMs >= 5000),
                _               => query
            };
        }

        return query;
    }
}
