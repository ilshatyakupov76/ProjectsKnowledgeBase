# База знаний проектов системного интегратора

Веб-приложение для поиска проектов по примерному названию реализованной функциональности. Приложение запускается в Docker и состоит из frontend-контейнера, Python backend API и PostgreSQL.

## Как открыть

1. Установите Docker Desktop.
2. При необходимости скопируйте `.env.example` в `.env` и измените параметры БД.
3. Запустите приложение:

```powershell
docker compose up --build
```

4. Откройте в браузере:

```text
http://localhost:8080
```

Для полного сброса базы данных и volume:

```powershell
docker compose down -v
```

## Что умеет

- искать похожие функциональности по названию и атрибутам;
- фильтровать результаты по заказчику, отрасли, платформе, продукту и стеку;
- показывать таблицу проектов с трудозатратами на аналитику, разработку и тестирование;
- сортировать результаты по похожести, суммарным трудозатратам и названию проекта;
- добавлять новые проекты и функциональности в PostgreSQL;
- импортировать и экспортировать базу знаний в JSON;
- восстанавливать демонстрационные данные.

## Архитектура

```text
browser -> frontend (Nginx) -> backend (FastAPI) -> db (PostgreSQL)
```

Сервисы Docker Compose:

- `frontend` - раздает статические файлы и проксирует `/api/*` на backend;
- `backend` - Python FastAPI, миграции Alembic, seed демонстрационных данных;
- `db` - PostgreSQL с постоянным Docker volume.

## Переменные окружения

Файл `.env.example` содержит значения по умолчанию:

- `POSTGRES_DB` - имя базы данных;
- `POSTGRES_USER` - пользователь PostgreSQL;
- `POSTGRES_PASSWORD` - пароль PostgreSQL;
- `DATABASE_URL` - строка подключения backend к PostgreSQL.

## API

- `GET /api/health` - проверка backend;
- `GET /api/projects` - список проектов с функциональностями;
- `GET /api/features/search?q=&client=&industry=&platform=&product=&stack=` - поиск и фильтрация;
- `POST /api/projects` - создание проекта с функциональностями;
- `GET /api/filters` - значения фильтров;
- `GET /api/export` - экспорт JSON;
- `POST /api/import` - импорт JSON с заменой текущей базы;
- `POST /api/reset-demo-data` - восстановление демонстрационных данных.

## Формат JSON

```json
[
  {
    "id": "project-id",
    "name": "Название проекта",
    "client": "Заказчик",
    "industry": "Отрасль",
    "platform": "Платформа",
    "product": "Продукт платформы",
    "features": [
      {
        "name": "Название функциональности",
        "analysisHours": 24,
        "developmentHours": 80,
        "testingHours": 20,
        "stack": "JavaScript, REST API"
      }
    ]
  }
]
```
