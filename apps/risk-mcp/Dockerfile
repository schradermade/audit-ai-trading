FROM python:3.13-slim

RUN apt-get update \
    && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*

ARG APP_VERSION
ENV PYTHONPATH=/app
ENV APP_VERSION=$APP_VERSION

WORKDIR /app

COPY apps/risk-mcp/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY shared /app/shared
COPY apps/risk-mcp/apps /app/apps
COPY policies /app/policies

CMD ["uvicorn", "apps.risk_mcp.main:app", "--host", "0.0.0.0", "--port", "8020"]
