using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Collector.Handlers;

public static class HealthHandlers
{
    public static IEndpointRouteBuilder MapHealthHandlers(this IEndpointRouteBuilder app)
    {
        app.MapGet("/ping", Ping)
            .WithTags("Health")
            .WithSummary("Проверка доступности сервиса")
            .WithDescription("Используется Web Server'ом для определения, жив ли Collector.");

            return app;
    }

    private static IResult Ping() => Results.Ok(new { status = "ok" });
}
