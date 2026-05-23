using Collector.Middleware;
using Collector.Services;
using Collector.Handlers;
using Infrastructure.Repositories.Interfaces;
using Infrastructure.Context;
using Infrastructure.Repositories;
using Scalar.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// DB
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// DI
builder.Services.AddScoped<IProxyRepository, ProxyRepository>();
builder.Services.AddSingleton<DaemonState>();
builder.Services.AddSingleton<ProxyChecker>();
builder.Services.AddHostedService<DaemonHostedService>();

// Swagger (OpenAPI)
builder.Services.AddOpenApi();

var app = builder.Build();

app.MapOpenApi();
app.MapScalarApiReference();

app.UseWhen(ctx =>
    !ctx.Request.Path.StartsWithSegments("/openapi") &&
    !ctx.Request.Path.StartsWithSegments("/scalar"), b => b.UseApiKeyAuth());

// Handlers
app.MapHealthHandlers();
app.MapDaemonHandlers();

app.Run();
