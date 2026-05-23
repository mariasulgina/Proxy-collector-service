FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY backend/Shared/Domain/Domain.csproj Shared/Domain/
COPY backend/Shared/Infrastructure/Infrastructure.csproj Shared/Infrastructure/
COPY backend/Collector/Collector.csproj Collector/

RUN dotnet restore Collector/Collector.csproj

COPY backend/Shared/ Shared/
COPY backend/Collector/ Collector/

RUN dotnet publish Collector/Collector.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Collector.dll"]
