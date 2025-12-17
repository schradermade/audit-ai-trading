FROM python:3.13-slim

WORKDIR /app

COPY apps/audit-mcp/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY shared /app/shared
COPY apps/audit-mcp/apps /app/apps

ENV PYTHONPATH=/app

CMD ["uvicorn", "apps.audit_mcp.main:app", "--host", "0.0.0.0", "--port", "8010"]
