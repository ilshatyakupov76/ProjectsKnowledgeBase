# Project Instructions

AGENTS.md is a living knowledge base for this project. Keep it accurate as the application, architecture, documentation, and user preferences evolve.

## First Step

Before starting any work on this project, read `PROJECT_DESCRIPTION.md` first.

Use it as the primary context for the product purpose, domain model, current implementation, and planned development direction. If `PROJECT_DESCRIPTION.md` conflicts with the current code or `README.md`, verify the actual implementation before editing.

## Project Summary

This project is a web application for maintaining a knowledge base of system integrator projects. Its main purpose is to help analysts, architects, project managers, and presale teams find previously implemented functionality by approximate name and reuse project experience for estimating new customer requests.

The core domain model:

- A project has a customer, industry, platform, platform product, and a list of implemented features.
- A feature has a name, analysis effort, development effort, testing effort, and technology stack.
- Search results show matching features together with their project attributes, total effort, stack, and similarity score.

## Technologies And Architecture

The current architecture is Docker-based:

```text
browser -> frontend (Nginx) -> backend (FastAPI) -> db (PostgreSQL)
```

Main technologies:

- Frontend: static `index.html`, `styles.css`, and vanilla `app.js`.
- Frontend runtime: Nginx container; `/api/*` is proxied to the backend.
- Backend: Python 3.12 in Docker, FastAPI, Uvicorn.
- Data layer: SQLAlchemy ORM, psycopg 3, PostgreSQL.
- Migrations: Alembic.
- Configuration: environment variables, `.env.example`, `pydantic-settings`.
- Runtime orchestration: Docker Compose.

Architectural principles:

- The browser must not connect to PostgreSQL directly.
- The frontend works with data only through backend HTTP API calls.
- PostgreSQL is the source of truth for project data.
- Main project data must not be stored in browser `localStorage`.
- Schema changes must go through SQLAlchemy models and Alembic migrations.
- Python is expected to run inside Docker; local Python installation on Windows is not required for normal project work.
- Docker Compose is the primary way to run and verify the full application.

## Project Structure

- `index.html` - static UI structure.
- `styles.css` - visual design and responsive layout.
- `app.js` - frontend state, rendering, API calls, import/export, project creation.
- `Dockerfile` - frontend image based on Nginx.
- `nginx.conf` - frontend server config and `/api/*` proxy to backend.
- `docker-compose.yml` - `frontend`, `backend`, `db`, PostgreSQL volume, healthcheck, startup command.
- `.env.example` - documented default environment variables for PostgreSQL and backend DB connection.
- `backend/Dockerfile` - Python backend image; supports local `backend/.wheels` fallback for unstable PyPI downloads.
- `backend/requirements.txt` - pinned backend dependencies.
- `backend/app/main.py` - FastAPI routes.
- `backend/app/models.py` - SQLAlchemy `Project` and `Feature` models.
- `backend/app/schemas.py` - Pydantic request schemas with frontend-facing camelCase fields.
- `backend/app/service.py` - project listing, creation, replacement, and public serialization helpers.
- `backend/app/search.py` - approximate search scoring and token normalization.
- `backend/app/database.py` - SQLAlchemy engine and session dependency.
- `backend/app/config.py` - application settings loaded from environment.
- `backend/app/demo_data.py` - demonstration dataset used by seed/reset flows.
- `backend/app/seed.py` - loads demo data only when the database is empty.
- `backend/alembic/` - Alembic configuration and migrations.
- `backend/.wheels/.gitkeep` - keeps the optional local wheelhouse directory in git; actual `.whl` files are ignored.

## Existing Documentation And Decision Records

- `PROJECT_DESCRIPTION.md` - product purpose, domain model, main scenario, current implementation, data storage, and future development ideas. This file must be read first before project work.
- `README.md` - practical run instructions, Docker Compose usage, environment variables, API list, and JSON format.
- `AGENTS.md` - operational memory for agents working on the project: conventions, preferences, project learnings, and maintenance rules.
- `.env.example` - environment variable reference for Docker Compose and backend configuration.
- `backend/alembic/versions/*.py` - executable database schema history. Treat migrations as architecture records for persistence changes.

There are currently no separate ADR files or `docs/` directory.

Documentation update rule:

- When functionality, API shape, data model, Docker behavior, environment variables, or user-visible behavior changes, update the related documentation in the same task.
- Update `PROJECT_DESCRIPTION.md` when the product behavior, domain model, or current implementation changes.
- Update `README.md` when setup, run commands, API endpoints, environment variables, or JSON formats change.
- Update `AGENTS.md` when development rules, user preferences, architecture decisions, or project learnings change.
- Add or update Alembic migrations when database schema changes.

## Development And Coding Rules

- Keep changes scoped to the requested task and existing architecture.
- Prefer the current patterns before introducing new abstractions or frameworks.
- Keep the frontend static unless there is a clear reason to introduce a build step.
- Keep frontend API payloads in camelCase, for example `analysisHours`, `developmentHours`, `testingHours`.
- Keep database column names in snake_case, for example `analysis_hours`, `development_hours`, `testing_hours`.
- Put database write/read behavior in backend service functions rather than duplicating it across API handlers.
- Use Pydantic schemas to validate incoming API payloads.
- Preserve the existing import/export JSON shape unless the task explicitly changes it.
- Use Alembic for all database schema changes.
- Keep demo data aligned with the current schema and user-visible examples.
- Keep Russian UI and documentation text consistent with the product audience.
- Do not commit downloaded wheel files from `backend/.wheels`; only `.gitkeep` belongs in git.
- Do not use `docker compose down -v` unless the user explicitly wants to reset the database volume.

## Designing New Features

When adding a new feature:

1. Start from the domain model: decide whether the change belongs to `Project`, `Feature`, filtering/search, import/export, or UI-only behavior.
2. If persistence changes, update SQLAlchemy models, Pydantic schemas, Alembic migration, service serialization, demo data, frontend forms, import/export, and documentation together.
3. If adding a new filter, update `/api/filters`, `/api/features/search`, frontend controls, rendering, and docs.
4. If adding new write behavior, expose it through the backend API; do not write directly from the browser to the database.
5. Keep destructive operations explicit. `POST /api/import` replaces the current database, and `POST /api/reset-demo-data` restores demo data.
6. Preserve data after normal container restarts; only volume deletion should reset PostgreSQL.
7. Prefer clear, practical UI flows over decorative or marketing-style pages.

## Testing Requirements

Minimum verification for backend/database changes:

- `docker compose up --build -d` starts `frontend`, `backend`, and `db`.
- `docker compose ps` shows PostgreSQL healthy and all services running.
- `GET /api/health` returns `{"status":"ok"}`.
- Alembic migrations apply successfully at backend startup.
- PostgreSQL contains expected tables, including `projects`, `features`, and `alembic_version`.
- Seed data loads on an empty database.
- Adding a project through the UI or `POST /api/projects` writes to PostgreSQL.
- Data remains after `docker compose restart` or container recreation without `-v`.
- Search works by approximate feature name and customer.
- Filters work by customer, industry, platform, product, and stack.
- Import/export JSON works with the current schema.
- `POST /api/reset-demo-data` restores the demo dataset.

Suggested useful checks:

```powershell
docker compose ps
Invoke-WebRequest -UseBasicParsing http://localhost:8080/api/health
docker compose exec -T db psql -U kb_user -d project_kb -c "\dt"
docker compose exec -T db psql -U kb_user -d project_kb -c "select count(*) as projects from projects; select count(*) as features from features;"
```

Frontend smoke check:

- Open `http://localhost:8080`.
- Search for an existing feature or customer.
- Add a small test project and verify it appears in `/api/export` or in PostgreSQL.

## Documentation Requirements

- Keep documentation in Russian unless a file already has a strong reason to stay in English.
- Document all new environment variables in `.env.example` and `README.md`.
- Document all API additions or changed payload fields in `README.md`.
- Keep `PROJECT_DESCRIPTION.md` aligned with the actual current implementation.
- Keep this `AGENTS.md` updated after meaningful work.
- At the end of each significant task:
  - check whether documentation needs updates;
  - update related documents;
  - update `User Preferences` if a new user preference was learned;
  - update `Project Learnings` if a new project fact, limitation, or decision was discovered;
  - briefly describe documentation changes in the final response.

## Project Memory

### User Preferences

- The user works in Russian and prefers Russian explanations and documentation.
- The user explicitly wants `PROJECT_DESCRIPTION.md` to be read first whenever work on this project begins.
- The user prefers concrete implementation when they ask to implement, and no code changes when they explicitly ask only for a plan.
- The user prefers Docker-based setup for this project, including Python backend running inside Docker rather than requiring local Python on Windows.
- The user wants PostgreSQL in Docker as the persistent project database.
- The user uses GitHub and asks explicitly when they want commits or pushes.
- The user values practical verification commands and clear reports of what was checked.
- The user wants project memory to accumulate in `AGENTS.md` over time.

### Project Learnings

- The main branch is `main`.
- The repository remote is `https://github.com/ilshatyakupov76/ProjectsKnowledgeBase.git`.
- The current Docker Compose stack has three services: `frontend`, `backend`, and `db`.
- PostgreSQL runs as `postgres:16-alpine` and stores data in the `postgres_data` Docker volume.
- Backend starts only after PostgreSQL healthcheck succeeds.
- Backend startup command applies Alembic migrations, seeds demo data if the database is empty, and starts Uvicorn.
- Initial schema has two domain tables: `projects` and `features`.
- Demo seed currently creates 5 projects and 15 features on an empty database.
- Approximate search scores tokens across feature name, project name, customer, industry, platform, product, and stack.
- Filters currently use exact values returned by `/api/filters`.
- `POST /api/projects` creates a project and nested features in PostgreSQL.
- `POST /api/import` replaces all projects and features.
- `POST /api/reset-demo-data` replaces all data with demo data.
- The backend Docker build may hit unstable PyPI/DNS behavior on Docker Desktop. The project supports an optional local `backend/.wheels` cache; downloaded `.whl` files are ignored by git.
- `docker compose down -v` deletes the PostgreSQL volume and fully resets stored data.
