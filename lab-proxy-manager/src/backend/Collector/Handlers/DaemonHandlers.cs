using Collector.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Collector.Handlers;

public static class DaemonHandlers
{
    public static IEndpointRouteBuilder MapDaemonHandlers(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/daemon")
            .WithTags("Daemon");

        group.MapGet("/status", GetStatus)
            .WithSummary("Получить статус демона")
            .WithDescription("Возвращает текущее состояние сборщика. Running или Stopped.");

        group.MapPost("/start", Start)
            .WithSummary("Запустить демон")
            .WithDescription("Включает периодический сбор прокси из активных пакетов. Возвращает обновлённый статус.");

        group.MapPost("/stop", Stop)
            .WithSummary("Остановить демон")
            .WithDescription("Останавливает сборщик. Уже собранные прокси остаются в БД. Возвращает обновлённый статус.");

        return app;
    }

    private static IResult GetStatus(DaemonState state) =>
        Results.Ok(new { status = state.IsRunning ? "Running" : "Stopped" });

    private static IResult Start(DaemonState state)
    {
        state.IsRunning = true;
        return Results.Ok();
    }

    private static IResult Stop(DaemonState state)
    {
        state.IsRunning = false;
        return Results.Ok();
    }
}
