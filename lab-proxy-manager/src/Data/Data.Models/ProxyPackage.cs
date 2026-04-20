using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Models;

public class ProxyPackage
{
    [Key]
    public int Id { get; set; }

    public string? Name { get; set; }
    public int? SourcesCount { get; set; }
    public bool? IsActive { get; set; }
    public DateTime? LastChecked { get; set; }
    public bool? IsRemoved { get; set; }

    public List<ProxyNode>? Proxies { get; set; } = new();
}
