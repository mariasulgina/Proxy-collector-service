using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Models;

public class ProxyNode
{
    [Key]
    public int? Id { get; set; }

    public string? Ip { get; set; } 
    public int IpVersion { get; set; } = IpVersion.IPv4;
    public int? Port { get; set; }

    public int ProtocolType { get; set; } = ProtocType.Http;
    public string? ProtocolVersion { get; set; }
    public bool IsSecure { get; set; } = false;

    [NotMapped]
    public string FullProtocolName => ProtocolType switch
    {
        ProtocType.Http => $"{(IsSecure ? "HTTPS" : "HTTP")}/{ProtocolVersion ?? "1.1"}",
        ProtocType.Socks => $"SOCKS{ProtocolVersion ?? "5"}",
        _ => "Unknown"
    };

    public DateTime? LastChecked { get; set; } 
    public int? Ping { get; set; }

    [NotMapped]
    public string Status => Ping switch
    {
        < 200 => "Хорошее",
        <= 500 => "Нормальное",
        <= 1500 => "Плохое",
        _ => "Нет подключения"
    };

    public int? PackageId { get; set; }

    [ForeignKey("PackageId")]
    public ProxyPackage? Package { get; set; }
}
