using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.OpenApi;
using Microsoft.AspNetCore.Builder;
using Domain.Models;
using Microsoft.OpenApi.Models;  

namespace WebServer.Extensions;

public static class SwaggerExtensions
{
    public static void AddSwaggerDocumentation(this WebApplicationBuilder builder)
    {
        var apiKeyDescription = builder.Environment.IsDevelopment() 
            ? $" (Текущий ключ: {builder.Configuration["ApiKey"]})" 
            : "";

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo 
            { 
                Title = "WebServer API", 
                Version = "v1" 
            });

            options.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
            {
                Description = $"Введите API ключ{apiKeyDescription}",
                Name = "X-Api-Key", 
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "ApiKey" }
                    },
                    Array.Empty<string>()
                }
            });
        });
    }
}
