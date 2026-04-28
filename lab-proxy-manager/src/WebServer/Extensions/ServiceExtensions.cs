namespace WebServer.Extensions;

public static class ServiceExtensions
{
    public static void AddDatabase(this WebApplicationBuilder builder)
    {
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));
    }

    public static void AddApplicationServices(this WebApplicationBuilder builder)
    {
        builder.Services.AddScoped<IProxyRepository, ProxyRepository>();
        builder.Services.AddScoped<IProxyService, ProxyService>();
    }

    public static void AddCollectorClient(this WebApplicationBuilder builder)
    {
        builder.Services.AddHttpClient<CollectorClient>(client =>
        {
            client.BaseAddress = new Uri(builder.Configuration["Collector:BaseUrl"] ?? "http://localhost:5000");
            client.DefaultRequestHeaders.Add("X-Api-Key", builder.Configuration["Collector:ApiKey"]);
        });
    }

    public static void AddCorsPolicy(this WebApplicationBuilder builder)
    {
        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
                policy.WithOrigins(builder.Configuration["Cors:AllowedOrigin"] ?? "*")
                    .AllowAnyMethod()
                    .AllowAnyHeader());
        });
    }
}
