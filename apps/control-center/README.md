# Control Center - Audit AI Trading

A Next.js-based control center frontend for the Audit AI Trading system.

## Overview

The Control Center provides a web-based interface for monitoring, managing, and interacting with the audit-first AI trading system. It offers real-time visibility into service health, audit logs, trade decisions, policy management, and advisory quality.

## Features

### Current (v0.1.0)
- **Dashboard**: Real-time health monitoring of all services (Orchestrator, Audit-MCP, Risk-MCP)
- **Navigation**: Sidebar navigation with 7 main sections
- **Responsive Layout**: Modern UI with Tailwind CSS and shadcn/ui components
- **Type Safety**: Full TypeScript integration matching Python Pydantic schemas
- **API Integration**: Proxy routes for all backend services

### Planned Features
- Audit log viewer with trace search
- Trade recommendation submission interface
- Policy management and testing
- Actor/user management
- Advisory quality monitoring
- Real-time metrics and analytics

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React Query (planned)
- **Icons**: Lucide React

## Project Structure

```
control-center/
├── app/                          # Next.js app router pages
│   ├── (dashboard)/             # Dashboard route group
│   │   └── page.tsx             # Main dashboard
│   ├── api/                     # API proxy routes
│   │   ├── orchestrator/        # Orchestrator proxy
│   │   ├── audit/               # Audit-MCP proxy
│   │   └── risk/                # Risk-MCP proxy
│   ├── audit/                   # Audit logs page
│   ├── trades/                  # Trades page
│   ├── policies/                # Policies page
│   ├── actors/                  # Actors page
│   ├── advisories/              # Advisories page
│   ├── settings/                # Settings page
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── badge.tsx
│   ├── dashboard/               # Dashboard components
│   │   └── health-status-card.tsx
│   └── layout/                  # Layout components
│       ├── sidebar-nav.tsx
│       └── header.tsx
├── lib/
│   ├── api/                     # API clients
│   │   ├── orchestrator-client.ts
│   │   ├── audit-client.ts
│   │   └── risk-client.ts
│   ├── types/                   # TypeScript type definitions
│   │   ├── common.ts
│   │   ├── trade.ts
│   │   ├── audit.ts
│   │   └── health.ts
│   └── utils/
│       └── cn.ts                # Class name utility
└── public/                      # Static assets
```

## Development

### Prerequisites
- Node.js 18+ (for local development)
- npm or yarn

### Local Development

1. Install dependencies:
```bash
cd apps/control-center
npm install
```

2. Create `.env.local` file:
```bash
cp .env.example .env.local
```

3. Configure environment variables:
```env
ORCHESTRATOR_URL=http://localhost:8000
AUDIT_MCP_URL=http://localhost:8010
RISK_MCP_URL=http://localhost:8020
NEXT_PUBLIC_APP_ENV=dev
NEXT_PUBLIC_APP_VERSION=0.1.0
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### Docker Deployment

The control center is included in the docker-compose.yml at the project root:

```bash
# From project root
docker-compose up control-center
```

Or start all services:

```bash
docker-compose up
```

The control center will be available at [http://localhost:3000](http://localhost:3000)

## API Integration

The control center proxies requests to backend services through Next.js API routes:

- `/api/orchestrator/*` → Orchestrator service (port 8000)
- `/api/audit/*` → Audit-MCP service (port 8010)
- `/api/risk/*` → Risk-MCP service (port 8020)

This approach provides:
- CORS handling
- Request/response transformation
- Error normalization
- Future: Authentication, rate limiting, caching

## Type Safety

TypeScript types in `lib/types/` match Python Pydantic schemas:

- `common.ts` - Actor, roles
- `trade.ts` - Trade intents, recommendations, risk flags
- `audit.ts` - Audit events, write requests/responses
- `health.ts` - Health check responses

## Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ORCHESTRATOR_URL` | Orchestrator service URL | `http://localhost:8000` |
| `AUDIT_MCP_URL` | Audit-MCP service URL | `http://localhost:8010` |
| `RISK_MCP_URL` | Risk-MCP service URL | `http://localhost:8020` |
| `NEXT_PUBLIC_APP_ENV` | Environment name | `dev` |
| `NEXT_PUBLIC_APP_VERSION` | App version | `0.1.0` |

## Roadmap

### Phase 1: Foundation ✅ (Complete)
- [x] Project setup with Next.js 14
- [x] TypeScript configuration
- [x] Tailwind CSS and shadcn/ui
- [x] Basic layout and navigation
- [x] Health status dashboard
- [x] API proxy routes

### Phase 2: Audit & Monitoring
- [ ] Audit log search interface
- [ ] Trace timeline visualization
- [ ] Hash chain verification UI
- [ ] Real-time metrics charts
- [ ] Service health alerts

### Phase 3: Trade Interface
- [ ] Trade recommendation form
- [ ] Decision display with risk flags
- [ ] Advisory inspection
- [ ] Trade history and filtering
- [ ] Manual override workflow

### Phase 4: Policy & User Management
- [ ] Policy list and viewer
- [ ] Policy editor with validation
- [ ] Policy testing interface
- [ ] Actor/user management
- [ ] Activity audit trails

### Phase 5: Analytics & Polish
- [ ] Advisory quality dashboard
- [ ] Advanced analytics
- [ ] Export functionality
- [ ] Performance optimization
- [ ] Comprehensive error handling

## Contributing

When adding new features:

1. Create types in `lib/types/` matching backend schemas
2. Create API client methods in `lib/api/`
3. Build reusable UI components in `components/ui/`
4. Create feature-specific components in `components/{feature}/`
5. Add pages in `app/{route}/`

## License

Same as parent project.
