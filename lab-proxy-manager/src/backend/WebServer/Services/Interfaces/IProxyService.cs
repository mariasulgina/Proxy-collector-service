using WebServer.DTOs;

namespace WebServer.Services.Interfaces;

public interface IProxyService
{
    Task<PagedResultDto<ProxyDto>> GetPageAsync(int page, int pageSize, string? status, string? protocol);
    Task<ProxyDto?> GetByIdAsync(int id);
    Task<ProxyDto> AddAsync(CreateProxyDto dto);
    Task<bool> DeleteAsync(int id);

    /// <summary>Импортирует прокси из CSV-файла. Дубликаты пропускаются без ошибки.</summary>
    Task<CsvImportResultDto> ImportFromCsvAsync(IFormFile file);

    /// <summary>Удаляет список прокси по ID. Возвращает количество удалённых.</summary>
    Task<int> DeleteRangeAsync(IReadOnlyList<int> ids);

    /// <summary>Экспортирует один прокси в виде CSV-строки по его ID.</summary>
    Task<string?> ExportByIdAsync(int id);

    /// <summary>Экспортирует все прокси, удовлетворяющие фильтрам, в виде CSV-строки.</summary>
    Task<string> ExportFilteredAsync(string? status, string? protocol);
}
