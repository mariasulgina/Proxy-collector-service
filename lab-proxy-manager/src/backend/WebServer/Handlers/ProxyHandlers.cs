using WebServer.DTOs;  
using WebServer.Services.Interfaces;
namespace WebServer.Handlers;

public static class ProxyHandlers
{
    public static void MapProxyEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/proxies", async (
            IProxyService service,
            int page = 1,
            int pageSize = 10,
            string? status = null,
            string? protocol = null) =>
        {
            var result = await service.GetPageAsync(page, pageSize, status, protocol);
            return Results.Ok(result);
        })
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized);

        app.MapPost("/proxies", async (CreateProxyDto dto, IProxyService service) =>
        {
            var created = await service.AddAsync(dto);
            return Results.Created($"/proxies/{created.Id}", created);
        })
        .Produces<ProxyDto>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status400BadRequest) 
        .Produces(StatusCodes.Status401Unauthorized);

        app.MapDelete("/proxies/{id:int}", async (int id, IProxyService service) =>
        {
            var deleted = await service.DeleteAsync(id);
            return deleted ? Results.NoContent() : Results.NotFound();
        })
        .Produces(StatusCodes.Status204NoContent) 
        .Produces(StatusCodes.Status404NotFound) 
        .Produces(StatusCodes.Status401Unauthorized);
    }
}
