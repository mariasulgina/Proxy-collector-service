namespace WebServer.Middleware;

public class ApiKeyMiddleware
{
    private readonly string _apiKey;
    private readonly string HeaderName;
    private readonly RequestDelegate _next;

    public ApiKeyMiddleware(RequestDelegate next, IConfiguration config)
    {
        _next = next;
        _apiKey = config["ApiKey"] ?? throw new InvalidOperationException("ApiKey is not configured in appsettings");
        HeaderName = "X-Api-Key";
    }

    public async Task InvokeAsync(HttpContext ctx)
    {
        if (ctx.Request.Path.StartsWithSegments("/swagger") || 
            ctx.Request.Path.StartsWithSegments("/index.html"))
        {
            await _next(ctx);
            return;
        }

        if (!ctx.Request.Headers.TryGetValue(HeaderName, out var provided) || provided != _apiKey)
        {
            ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await ctx.Response.WriteAsync("Invalid or missing API key");
            return;
        }

        await _next(ctx);
    }

    public static IApplicationBuilder UseApiKeyAuth(this IApplicationBuilder app)
        => app.UseMiddleware<ApiKeyMiddleware>();
}
