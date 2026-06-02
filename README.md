# Proxy Collector & Validator
Многокомпонентная асинхронная контейнерная система сбора, валидации и пакетного менеджмента прокси-адресов на базе распределенной архитектуры (.NET 9 / React).

## Содержание
- [О проекте](#о-проекте)
- [Архитектура](#архитектура)
- [Компоненты симуляции](#компоненты-симуляции)
- [Метрики](#метрики)
- [Конфигурация](#конфигурация)
- [Установка и запуск](#установка-и-запуск)
- [Пример лога](#пример-лога)
- [Структура проекта](#структура-проекта)

## О проекте
Приложение представляет собой конвейерную автоматизированную систему для работы с резидентскими и мобильными прокси-пулами. Система в фоновом режиме (через Демона) выполняет чекинг и валидацию больших массивов IP-адресов, собирает аналитику, а веб-интерфейс позволяет управлять пакетами прокси, включать/отключать их и отслеживать логи в реальном времени.

## Архитектура
Проект выполнен в распределенной контейнерной парадигме и разделен на изолированные слои:

1. **Frontend (Presentation):** Одностраничное веб-приложение (SPA) на React для визуализации данных.
2. **Backend (WebServer):** REST API на ASP.NET Core для управления бизнес-логикой и координации компонентов.
3. **Background Worker (Collector/Daemon):** Фоновая служба для непрерывной проверки состояния сетевых узлов.
4. **Database (Persistence):** Реляционное хранилище PostgreSQL под управлением Entity Framework Core.

## Компоненты системы
Валидация и процессинг прокси-адресов проходят асинхронно через специализированные модули:

| № | Компонент / Этап | Особенности работы |
| --- | --- | --- |
| 1 | **Пакетный менеджер** | Загрузка прокси из пакетов. Каждый пакет - это отдельный провайдер-источник, по кторому происходит сбор прокси. Написан по определенному шаблону. Это в перспективе проработки проекта. |
| 2 | **Фоновый Демон** | `BackgroundService` на базе .NET 9, оптимизированный под высокую нагрузку на память. Собирает и проверяет прокси по пакетам-источникам. Фоновая программа на локальном устройстве пользователя. |
| 3 | **Валидатор - часть фоновой программы** | Асинхронный пинг целевых узлов, проверка кодов ответов и доступности сети. |
| 4 | **Интерфейс OpenAPI / Scalar** | Нативная кодогенерация спецификации API без сторонних зависимостей типа Swashbuckle. |

## Технологический стек
* **Frontend:** React, JavaScript (JSX), Vite, CSS.
* **Backend & Background:** .NET 9 (Native OpenAPI via `Microsoft.AspNetCore.OpenApi`), Web API, Kestrel, Dependency Injection.
* **ORM & DB:** Entity Framework Core (EF Core), PostgreSQL.
* **Инструменты визуализации API:** Scalar / Swagger UI.
* **Оркестрация:** Docker, Docker Compose.

## Конфигурация
Все ключевые параметры, включая секретные API-ключи и строки подключения к базе данных, вынесены в переменные среды.

**Критически важно:** На фронтенде параметры вшиваются на этапе компиляции (**build-time**) с помощью префикса `VITE_`, так как SPA-приложение выполняется непосредственно в браузере клиента и не имеет прямого доступа к операционной системе хоста.

## Установка и запуск через Docker Compose
### Конфигурация `docker-compose.yml`

```yaml
services:
  postgres:
    image: postgres:15-alpine
    container_name: proxy-postgres
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 5

  webserver:
    container_name: proxy-webserver
    build:
      context: .
      dockerfile: backend/WebServer/Dockerfile
    restart: unless-stopped
    ports:
      - "${WEBSERVER_PORT}:8080"
    environment:
      ASPNETCORE_ENVIRONMENT: Development
      ApiKey: ${COLLECTOR_API_KEY}
      ConnectionStrings__Default: "Host=postgres;Port=5432;Database=${POSTGRES_DB};Username=${POSTGRES_USER};Password=${POSTGRES_PASSWORD}"
      Collector__BaseUrl: "http://collector:8080"
      Collector__ApiKey: ${COLLECTOR_API_KEY}
      Cors__AllowedOrigin: ${CORS_ALLOWED_ORIGIN}
      ASPNETCORE_URLS: "http://+:8080"
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    container_name: proxy-frontend
    build:
      context: .
      dockerfile: frontend/Dockerfile
      args:
        - VITE_API_KEY=${COLLECTOR_API_KEY}
        - VITE_API_URL=http://localhost:${WEBSERVER_PORT}
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      - webserver
```

### Команды развертывания

```bash
git clone https://github.com/your-username/proxy-collector.git
cd proxy-collector

docker compose up -d --build

```

## Интеграция API на фронтенде
Внутри React-компонентов обращение к проброшенным через Docker аргументам сборки выполняется декларативно через объект `import.meta.env`:

```javascript
// Считывание параметров, внедренных на этапе компиляции бандла
const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export const fetchPackages = async () => {
  const response = await fetch(`${API_URL}/api/packages`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': API_KEY
    }
  });
  return await response.json();
};

```
