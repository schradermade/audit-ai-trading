# AITDP “Gold” Scaffold (Orchestrator + Audit MCP + Shared Schemas)

Included:
- **orchestrator** (FastAPI): trust boundary, validation, safety gates, trace propagation
- **mcp-audit** (FastAPI): append-only audit log (SQLite), optional tamper-evident hash chain
- **shared schemas** (Pydantic v2)
- **docker-compose** for local run

## Quickstart
```bash
unzip aitdp_gold_scaffold.zip
cd aitdp_gold
cp infra/env.example .env
docker compose -f infra/docker-compose.yml up --build
```
Health:
- http://localhost:8000/health
- http://localhost:8010/health
