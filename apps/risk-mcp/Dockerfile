FROM python:3.13-slim

WORKDIR /app

COPY apps/risk-mcp/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY apps/risk-mcp/apps /app/apps
COPY policies /app/policies

ENV PYTHONPATH=/app

CMD ["uvicorn", "apps.risk_mcp.main:app", "--host", "0.0.0.0", "--port", "8020"]
