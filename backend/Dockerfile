FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
COPY .wheels ./wheels
RUN --mount=type=cache,target=/root/.cache/pip \
    if ls ./wheels/*.whl >/dev/null 2>&1; then \
        pip install --no-index --find-links=./wheels -r requirements.txt; \
    else \
        pip install --retries 20 --timeout 180 --index-url https://pypi.org/simple -r requirements.txt; \
    fi

COPY alembic.ini .
COPY alembic ./alembic
COPY app ./app
