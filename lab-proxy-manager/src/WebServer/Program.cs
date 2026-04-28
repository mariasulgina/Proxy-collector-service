using Infrastructure.Context;
using Infrastructure.Repositories;
using Domain.Repositories.Interfaces;
using WebServer.Services;
using WebServer.Services.Interfaces;
using WebServer.DTOs;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddDatabase();
builder.AddApplicationServices();
builder.AddCollectorClient();
builder.AddCorsPolicy();
builder.AddSwaggerDocumentation();

var app = builder.Build();

app.ApplyMigrations();
app.UseAppPipeline();

app.MapCollectorEndpoints();
app.MapProxyEndpoints();

app.Run();
