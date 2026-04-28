namespace WebServer.Extensions;

public static class MigrationExtensions
{
    public static void ApplyMigrations(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        db.Database.Migrate();
    }
}
