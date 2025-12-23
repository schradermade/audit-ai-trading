FROM python:3.13-slim

# Install curl for healthchecks (minimal, explicit)
RUN apt-get update \
    && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*

ARG APP_VERSION
ENV APP_VERSION=$APP_VERSION
ENV PYTHONPATH=/app

WORKDIR /app

COPY apps/orchestrator/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY shared /app/shared
COPY apps/orchestrator/apps /app/apps

CMD ["uvicorn", "apps.orchestrator.main:app", "--host", "0.0.0.0", "--port", "8020"]
