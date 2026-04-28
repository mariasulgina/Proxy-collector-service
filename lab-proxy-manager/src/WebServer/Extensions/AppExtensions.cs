namespace WebServer.Extensions;

public static class AppExtensions
{
    public static void UseAppPipeline(this WebApplication app)
    {
        app.UseSwagger();
        app.UseSwaggerUI();
        app.UseApiKeyAuth();
        //app.UseMiddleware<ApiKeyMiddleware>();
        app.UseCors();
    }
}
