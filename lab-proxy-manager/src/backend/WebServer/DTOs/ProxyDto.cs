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

/// <summary>
/// Тело запроса для массового удаления прокси.
/// </summary>
public class DeleteByIdsDto
{
    public List<int> Ids { get; set; } = [];
}

/// <summary>
/// Результат импорта CSV: сколько добавлено, сколько дублей, список строк с ошибками.
/// </summary>
public class CsvImportResultDto
{
    public int Imported { get; set; }
    public int Duplicates { get; set; }
    public List<string> Errors { get; set; } = [];
}
