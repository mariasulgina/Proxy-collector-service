using Infrastructure.Repositories;
using Infrastructure.Repositories.Interfaces;
using WebServer.Services;
using WebServer.Services.Interfaces;
using WebServer.DTOs;
using WebServer.Extensions; 
using WebServer.Handlers; 
using Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Domain.Exceptions;

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
