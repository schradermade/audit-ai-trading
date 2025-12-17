# Audit AI Trading (Monorepo)

An **audit-first, policy-driven architecture** for **AI-assisted trading decisions** in regulated environments.

This system is intentionally designed so that **AI can advise, but never approve or execute trades**. All meaningful actions are recorded as **append-only, hash-chained audit events**, enabling strong guarantees around traceability, accountability, and post-incident review.

---

## Why this exists

In financial services, producing a good answer is not sufficient. Systems must be able to prove:

- What happened
- In what order
- Under which rules
- With which inputs
- Who had authority
- That records were not altered

This repository implements the **control plane** required to safely introduce AI into trading workflows:

- Deterministic enforcement
- Explicit governance
- Immutable audit trails
- Clear separation between intelligence and authority

AI is treated as **advisory**, not autonomous.

---

## Core principles

1. **Audit-first**
   - Every request, decision, and enforcement step is recorded.
   - Audit is not a side effect; it is a prerequisite.

2. **Policy over prompt**
   - Rules are enforced by deterministic systems, not model instructions.
   - AI cannot override policy.

3. **Separation of concerns**
   - Intelligence (AI reasoning)
   - Authority (policy enforcement)
   - Evidence (audit record)

   These are explicitly separated by service boundaries.

4. **Human accountability**
   - Humans approve policy.
   - Humans approve exceptions.
   - AI never assumes authority.

---

## High-level architecture

This project is structured as a **monorepo** containing multiple deployable services (“apps”) and shared libraries.

### Current services

- **Orchestrator**
  - Entry point for decision requests
  - Coordinates workflow
  - Produces structured decision responses
  - Writes all significant events to Audit MCP

- **Audit MCP**
  - Immutable system of record
  - Append-only, hash-chained audit log
  - Supports trace-level retrieval for investigations

### Planned / upcoming services

- **Risk MCP**
  - Deterministic policy & limits engine
  - Enforces executable policy artifacts
- **Market MCP**
  - Bounded market data access
  - Freshness & provenance guarantees
- **Human approval workflows**
  - Explicit override and escalation events
- **Claude integration**
  - Advisory reasoning only
  - Tool-gated and policy-constrained
- **Evaluation harness**
  - Continuous safety and regression testing

---

## Repository layout

.
├── apps/
│   ├── orchestrator/
│   └── mcp-audit/
├── shared/
├── infra/
│   └── docker-compose.yml
├── .env
└── README.md

---

## Disclaimer

This repository is an architectural reference and learning system.
It is **not** a live trading platform, does not connect to brokers, and does not provide investment advice.
