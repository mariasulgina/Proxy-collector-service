using WebServer.Middleware;

namespace WebServer.Extensions;

public static class AppExtensions
{
    public static void UseAppPipeline(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(c => 
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "WebServer API v1");
                c.RoutePrefix = "swagger";
            });
            
            app.MapGet("/", () => Results.Redirect("/swagger"));
        }

        app.UseApiKeyAuth();
        //app.UseMiddleware<ApiKeyMiddleware>();
        app.UseCors();
    }
}
