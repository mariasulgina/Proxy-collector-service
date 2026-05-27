using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using WebServer.DTOs;
using WebServer.Services.Interfaces;

namespace WebServer.Handlers;

public static class ProxyHandlers
{
    public static void MapProxyEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/proxies", async (
            [FromServices] IProxyService service,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? status = null,
            [FromQuery] string? protocol = null) =>
        {
            var result = await service.GetPageAsync(page, pageSize, status, protocol);
            return Results.Ok(result);
        })
        .Produces<PagedResultDto<ProxyDto>>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized);

        app.MapPost("/proxies", async ([FromBody] CreateProxyDto dto, [FromServices] IProxyService service) =>
        {
            var created = await service.AddAsync(dto);
            return Results.Created($"/proxies/{created.Id}", created);
        })
        .Produces<ProxyDto>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status401Unauthorized);

        app.MapDelete("/proxies/{id:int}", async (int id, [FromServices] IProxyService service) =>
        {
            var deleted = await service.DeleteAsync(id);
            return deleted ? Results.NoContent() : Results.NotFound();
        })
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status401Unauthorized);

        app.MapPost("/proxies/import", async (IFormFile file, [FromServices] IProxyService service) =>
        {
            if (file.Length == 0)
                return Results.BadRequest("Файл пустой.");

            if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
                return Results.BadRequest("Ожидается файл формата .csv.");

            var result = await service.ImportFromCsvAsync(file);
            return Results.Ok(result);
        })
        .DisableAntiforgery()
        .Produces<CsvImportResultDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status401Unauthorized)
        .WithSummary("Импорт прокси из CSV")
        .WithDescription("CSV должен содержать заголовок: ip,port,protocol");

        app.MapDelete("/proxies", async ([FromBody] DeleteByIdsDto dto, [FromServices] IProxyService service) =>
        {
            if (dto.Ids is null || dto.Ids.Count == 0)
                return Results.BadRequest("Список ID не может быть пустым.");

            var deleted = await service.DeleteRangeAsync(dto.Ids);
            return Results.Ok(new { deleted });
        })
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status401Unauthorized)
        .WithSummary("Удаление прокси по списку ID");

        app.MapGet("/proxies/{id:int}/export", async (int id, [FromServices] IProxyService service) =>
        {
            var csv = await service.ExportByIdAsync(id);
            if (csv is null) return Results.NotFound();

            return Results.File(
                Encoding.UTF8.GetBytes(csv),
                contentType: "text/csv",
                fileDownloadName: $"proxy-{id}.csv");
        })
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status401Unauthorized)
        .WithSummary("Экспорт одного прокси в CSV по ID");

        app.MapGet("/proxies/export", async (
            [FromServices] IProxyService service,
            [FromQuery] string? status = null,
            [FromQuery] string? protocol = null) =>
        {
            var csv = await service.ExportFilteredAsync(status, protocol);

            return Results.File(
                Encoding.UTF8.GetBytes(csv),
                contentType: "text/csv",
                fileDownloadName: "proxies-export.csv");
        })
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized)
        .WithSummary("Экспорт прокси в CSV по фильтрам")
        .WithDescription("Те же фильтры, что и у GET /proxies, но без пагинации");
    }
}
