using Microsoft.Extensions.Logging;

namespace WebServer.Middleware;

public class ApiKeyMiddleware
{
    private readonly string _apiKey;
    private readonly string HeaderName;
    private readonly RequestDelegate _next;
    private readonly ILogger<ApiKeyMiddleware> _logger;

    public ApiKeyMiddleware(RequestDelegate next, IConfiguration config, ILogger<ApiKeyMiddleware> logger)
    {
        _next = next;
        _logger = logger;
        _apiKey = config["ApiKey"] ?? throw new InvalidOperationException("ApiKey is not configured");
        HeaderName = "X-Api-Key";
        
        _logger.LogInformation("ApiKeyMiddleware initialized. Expected key: {Key}", _apiKey);
    }

    public async Task InvokeAsync(HttpContext ctx)
    {
        var path = ctx.Request.Path.Value ?? "";
        
        _logger.LogInformation("Request to: {Path}", path);
        
        if (path.StartsWith("/swagger") || path.StartsWith("/index.html"))
        {
            await _next(ctx);
            return;
        }

        if (!ctx.Request.Headers.TryGetValue(HeaderName, out var provided))
        {
            _logger.LogWarning("Missing API key header");
            ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await ctx.Response.WriteAsync("Missing API key header");
            return;
        }

        _logger.LogInformation("Provided key: {Key}, Expected key: {Expected}", provided, _apiKey);

        if (provided != _apiKey)
        {
            _logger.LogWarning("Invalid API key");
            ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await ctx.Response.WriteAsync("Invalid API key");
            return;
        }

        await _next(ctx);
    }
}

public static class ApiKeyMiddlewareExtensions
{
    public static IApplicationBuilder UseApiKeyAuth(this IApplicationBuilder app)
        => app.UseMiddleware<ApiKeyMiddleware>();
}
