FROM python:3.13-slim

WORKDIR /app

COPY apps/mcp-audit/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY shared /app/shared
COPY apps/mcp-audit/apps /app/apps

ENV PYTHONPATH=/app

CMD ["uvicorn", "apps.mcp_audit.main:app", "--host", "0.0.0.0", "--port", "8010"]
