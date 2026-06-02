using Microsoft.AspNetCore.Builder;
using WebServer.Services;

namespace WebServer.Handlers;

public static class CollectorHandlers
{
    public static void MapCollectorEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/collector/ping", async (CollectorClient collector) =>
        {
            var alive = await collector.PingAsync();
            return alive ? Results.Ok(new { status = "ok" }) : Results.StatusCode(503);
        })
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status503ServiceUnavailable);

        app.MapGet("/daemon/status", async (CollectorClient collector) =>
        {
            var status = await collector.GetDaemonStatusAsync();
            return Results.Ok(status);
        })
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status403Forbidden);

        app.MapPost("/daemon/start", async (CollectorClient collector) =>
        {
            await collector.StartDaemonAsync();
            return Results.NoContent();
        })
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status401Unauthorized);

        app.MapPost("/daemon/stop", async (CollectorClient collector) =>
        {
            await collector.StopDaemonAsync();
            return Results.NoContent();
        })
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status401Unauthorized);
    }
}
