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
        });

        app.MapGet("/daemon/status", async (CollectorClient collector) =>
        {
            var status = await collector.GetDaemonStatusAsync();
            return Results.Ok(status);
        });

        app.MapPost("/daemon/start", async (CollectorClient collector) =>
        {
            await collector.StartDaemonAsync();
            return Results.Ok();
        });

        app.MapPost("/daemon/stop", async (CollectorClient collector) =>
        {
            await collector.StopDaemonAsync();
            return Results.Ok();
        });
    }
}
