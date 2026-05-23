using Domain.Models;
using WebServer.DTOs;

namespace WebServer.Mappings;

public static class ProxyMapper
{
    public static ProxyDto ToDto(this Proxy p) => new()
    {
        Id = p.Id,
        Ip = p.Ip,
        Port = p.Port,
        Protocol = p.Protocol,
        ResponseTimeMs = p.ResponseTimeMs,
        Status = p.Status,
        LastChecked = p.LastChecked
    };

    public static IEnumerable<ProxyDto> ToDtoList(this IEnumerable<Proxy> proxies) 
        => proxies.Select(p => p.ToDto());

    public static Proxy ToEntity(this ProxyDto dto) => new()
    {
        Id = dto.Id, 
        Ip = dto.Ip,
        Port = dto.Port,
        Protocol = dto.Protocol,
        ResponseTimeMs = dto.ResponseTimeMs,
        LastChecked = dto.LastChecked
    };
}
