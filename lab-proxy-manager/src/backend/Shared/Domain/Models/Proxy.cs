using System;

namespace Domain.Models;

public class Proxy
{
    public int Id { get; set; }
    public string Ip { get; set; } = string.Empty;
    public int Port { get; set; }
    public string Protocol { get; set; } = "HTTP";
    public int ResponseTimeMs { get; set; }
    public DateTime LastChecked { get; set; }

    public string Status => ResponseTimeMs switch
    {
        < 200 => "Good",
        <= 500 => "Normal",
        <= 1500 => "Bad",
        _ => "No connection"
    };
}
