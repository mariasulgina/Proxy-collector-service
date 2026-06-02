using WebServer.Extensions;
using WebServer.Handlers;

var builder = WebApplication.CreateBuilder(args);

builder.AddDatabase();
builder.AddApplicationServices();
builder.AddCollectorClient();
builder.AddCorsPolicy();
builder.AddSwaggerDocumentation();

builder.Services.AddAntiforgery();

var app = builder.Build();

app.ApplyMigrations();
app.UseAppPipeline();

app.UseAntiforgery();

app.MapCollectorEndpoints();
app.MapProxyEndpoints();

app.Run();
