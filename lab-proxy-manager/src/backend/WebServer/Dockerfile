FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY backend/Shared/Domain/Domain.csproj Shared/Domain/
COPY backend/Shared/Infrastructure/Infrastructure.csproj Shared/Infrastructure/
COPY backend/WebServer/WebServer.csproj WebServer/

RUN dotnet restore WebServer/WebServer.csproj

COPY backend/Shared/ Shared/
COPY backend/WebServer/ WebServer/

RUN dotnet publish WebServer/WebServer.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "WebServer.dll"]
