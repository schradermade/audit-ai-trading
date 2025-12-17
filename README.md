# AI Trading Decision Platform (AITDP) - Audit & Orchestration Monorepo

A production-ready monorepo for AI-powered trading decision workflows with comprehensive audit logging, compliance tracking, and risk management capabilities.

## Overview

This monorepo implements a secure, auditable system for processing AI-generated trading recommendations. It provides:

- **Trust boundary enforcement** with validation and safety gates
- **Append-only audit logging** with optional tamper-evident hash chains
- **Trace propagation** for end-to-end request tracking
- **Compliance and risk flagging** for regulatory requirements

## Architecture

The system consists of two main services:

```
┌─────────────┐         ┌──────────────┐
│ Orchestrator│────────▶│  Audit MCP   │
│  (Port 8000)│         │  (Port 8010) │
└─────────────┘         └──────────────┘
     │                         │
     │                         │
     └───────── SQLite ────────┘
              (Audit DB)
```

### Components

#### 1. **Orchestrator** (`apps/orchestrator/`)

- **Purpose**: Main entry point for trade recommendation requests
- **Responsibilities**:
  - Request validation and trust boundary enforcement
  - Trade recommendation processing with risk/compliance checks
  - Trace ID propagation and management
  - Integration with audit service for event logging
- **Technology**: FastAPI, Pydantic v2

#### 2. **MCP Audit** (`apps/audit-mcp/`)

- **Purpose**: Append-only audit log service
- **Responsibilities**:
  - Immutable event storage in SQLite
  - Optional tamper-evident hash chain implementation
  - Trace-based event querying
  - Event integrity verification
- **Technology**: FastAPI, SQLite, SHA-256 hashing

#### 3. **Shared Schemas** (`shared/schemas/`)

- **Purpose**: Common data models shared across services
- **Schemas**:
  - `audit.py`: Audit event types and models
  - `trade.py`: Trade recommendation request/response models
  - `common.py`: Shared domain models (Actor, etc.)

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Python 3.13+ (for local development)

### Running with Docker Compose

1. **Clone and navigate to the repository**:

   ```bash
   cd audit-ai-trading
   ```

2. **Set up environment variables**:

   ```bash
   cp infra/env.example .env
   # Edit .env if needed (defaults work for local development)
   ```

3. **Start all services**:

   ```bash
   docker compose -f infra/docker-compose.yml up --build
   ```

4. **Verify services are healthy**:
   - Orchestrator: http://localhost:8000/health
   - MCP Audit: http://localhost:8010/health

### Local Development

For local development without Docker:

1. **Install dependencies** (from project root):

   ```bash
   # Install orchestrator dependencies
   pip install -r apps/orchestrator/requirements.txt

   # Install audit-mcp dependencies
   pip install -r apps/audit-mcp/requirements.txt
   ```

2. **Set environment variables**:

   ```bash
   export APP_ENV=dev
   export AUDIT_MCP_BASE_URL=http://localhost:8010
   export ORCH_REQUIRE_TRACE_ID=true
   export AUDIT_DB_PATH=./audit.db
   export AUDIT_HASH_CHAIN=true
   ```

3. **Run services** (in separate terminals):

   ```bash
   # Terminal 1: Start MCP Audit
   cd apps/audit-mcp
   uvicorn apps.audit_mcp.main:app --port 8010

   # Terminal 2: Start Orchestrator
   cd apps/orchestrator
   uvicorn apps.orchestrator.main:app --port 8000
   ```

## Configuration

### Environment Variables

| Variable                | Description               | Default                 | Service      |
| ----------------------- | ------------------------- | ----------------------- | ------------ |
| `APP_ENV`               | Application environment   | `dev`                   | Both         |
| `AUDIT_MCP_BASE_URL`    | Audit service URL         | `http://localhost:8010` | Orchestrator |
| `ORCH_REQUIRE_TRACE_ID` | Require X-Trace-Id header | `true`                  | Orchestrator |
| `AUDIT_DB_PATH`         | SQLite database path      | `/data/audit.db`        | Audit MCP    |
| `AUDIT_HASH_CHAIN`      | Enable hash chain         | `true`                  | Audit MCP    |

### Configuration Files

- `infra/env.example`: Template for environment variables
- `infra/docker-compose.yml`: Docker Compose service definitions
- `pyproject.toml`: Python project configuration (Black formatter settings)

## API Endpoints

### Orchestrator (Port 8000)

#### `GET /health`

Health check endpoint.

**Response**:

```json
{
  "status": "ok",
  "env": "dev"
}
```

#### `POST /trade/recommendation`

Submit a trade recommendation request.

**Headers**:

- `X-Trace-Id` (optional, required if `ORCH_REQUIRE_TRACE_ID=true`): Trace identifier for request tracking

**Request Body** (`TradeRecommendationRequest`):

```json
{
  "request_id": "uuid-string",
  "actor": {
    "user_id": "user123",
    "desk": "equity",
    "role": "trader"
  },
  "trade": {
    "symbol": "AAPL",
    "side": "buy",
    "quantity": 1000,
    "order_type": "market"
  },
  "intent": "Portfolio rebalancing",
  "constraints": {},
  "as_of": "2024-01-01T12:00:00Z"
}
```

**Response** (`TradeRecommendationResponse`):

```json
{
  "recommendation": "proceed",
  "modified_trade": null,
  "rationale": "Trade passes mock checks...",
  "risk_flags": [],
  "compliance": {
    "status": "pass",
    "policy_refs": ["RISK-000"],
    "evidence_refs": ["mock"]
  },
  "confidence": 0.75,
  "next_steps": ["create_execution_ticket"],
  "audit_id": "AUD-abc123..."
}
```

### Audit MCP (Port 8010)

#### `GET /health`

Health check endpoint.

**Response**:

```json
{
  "status": "ok",
  "env": "dev",
  "hash_chain": true
}
```

#### `POST /audit/log`

Write an audit event.

**Request Body** (`AuditWriteRequest`):

```json
{
  "trace_id": "trace-123",
  "event_type": "request_received",
  "timestamp": "2024-01-01T12:00:00Z",
  "payload": {
    "request_id": "uuid-string",
    "actor": {...}
  }
}
```

**Response** (`AuditWriteResponse`):

```json
{
  "audit_id": "AUD-abc123...",
  "event_hash": "sha256-hash",
  "prev_hash": "previous-hash-or-null"
}
```

#### `GET /audit/events?trace_id=<trace_id>`

Retrieve all audit events for a given trace ID.

**Query Parameters**:

- `trace_id` (required): Trace identifier

**Response**: Array of `AuditEvent` objects

## Project Structure

```
audit-ai-trading/
├── apps/
│   ├── audit-mcp/              # Audit logging service
│   │   ├── apps/
│   │   │   └── audit-mcp/
│   │   │       ├── main.py     # FastAPI application
│   │   │       ├── config.py   # Configuration
│   │   │       └── storage.py  # SQLite storage & hash chain
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   └── orchestrator/           # Main orchestration service
│       ├── apps/
│       │   └── orchestrator/
│       │       ├── main.py     # FastAPI application
│       │       ├── config.py   # Configuration
│       │       └── audit_client.py  # Audit service client
│       ├── Dockerfile
│       └── requirements.txt
├── shared/
│   └── schemas/                # Shared Pydantic models
│       ├── audit.py            # Audit event schemas
│       ├── trade.py            # Trade recommendation schemas
│       └── common.py           # Common domain models
├── infra/
│   ├── docker-compose.yml      # Docker Compose configuration
│   └── env.example             # Environment variable template
├── pyproject.toml              # Python project config
└── README.md                   # This file
```

## Features

### Audit Logging

- **Append-only storage**: Events are immutable once written
- **Hash chain**: Optional tamper-evident chain linking events by trace ID
- **Trace-based queries**: Retrieve all events for a request trace
- **Event integrity**: SHA-256 hashing for verification

### Trade Recommendation Processing

- **Request validation**: Pydantic models ensure data integrity
- **Risk flagging**: Automatic detection of high-risk trades
- **Compliance checking**: Policy reference tracking
- **Decision tracking**: All decisions are logged with full context

### Trace Propagation

- **End-to-end tracking**: Single trace ID spans entire request lifecycle
- **Optional enforcement**: Configurable requirement for trace IDs
- **Event correlation**: All events linked by trace ID

## Development

### Code Formatting

This project uses Black for code formatting:

```bash
black --line-length 100 --target-version py313 .
```

### Adding New Features

1. **New endpoints**: Add to the appropriate `main.py` file
2. **New schemas**: Add to `shared/schemas/` and import where needed
3. **New audit events**: Extend `AuditEventType` enum in `shared/schemas/audit.py`

### Testing

Health endpoints are available for basic service verification:

- Orchestrator: `curl http://localhost:8000/health`
- MCP Audit: `curl http://localhost:8010/health`

## Security Considerations

- **Trust boundary**: Orchestrator enforces validation before processing
- **Immutable audit log**: Events cannot be modified after creation
- **Hash chain**: Enables detection of tampering in audit records
- **Trace ID validation**: Optional enforcement prevents untracked requests

## License

## Contributing
