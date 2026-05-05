namespace WebServer.DTOs;

public class ProxyDto
{
    public int Id { get; set; }
    public string Ip { get; set; } = string.Empty;
    public int Port { get; set; }
    public string Protocol { get; set; } = string.Empty;
    public int ResponseTimeMs { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime LastChecked { get; set; }
}

public class CreateProxyDto
{
    public string Ip { get; set; } = string.Empty;
    public int Port { get; set; }
    public string Protocol { get; set; } = "HTTP";
    public int ResponseTimeMs { get; set; } = 9999;
}
