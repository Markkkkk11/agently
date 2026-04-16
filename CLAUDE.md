# AI Business Constructor — Project Context

## What is this project?
Online platform where entrepreneurs describe their business idea and get a virtual team of AI agents (web developer, designer, marketer, sales manager, support, analytics) that build and run their business infrastructure through chat interfaces.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript (strict), TailwindCSS, Zustand (state), React Query (data fetching)
- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic (migrations), Pydantic v2
- **Database**: PostgreSQL 16 + pgvector, Redis 7 (cache, sessions, OTP, queues)
- **LLM**: OpenAI-compatible API via httpx (configurable: OpenAI, Anthropic, GigaChat, YandexGPT)
- **Storage**: Local filesystem on MVP, S3-compatible in production
- **Auth**: JWT (access + refresh tokens), OTP via email/SMS
- **Deploy**: Docker Compose (MVP), Kubernetes (production)
- **Package manager**: pnpm (frontend), uv (backend)

## Project Structure
```
ai-business-constructor/
├── frontend/                 # Next.js 14 app
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   │   ├── (auth)/       # Login, register
│   │   │   ├── (dashboard)/  # Main app (protected)
│   │   │   │   ├── projects/
│   │   │   │   ├── catalog/
│   │   │   │   └── settings/
│   │   │   └── layout.tsx
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/           # Primitives (Button, Input, Card, etc.)
│   │   │   ├── chat/         # Chat interface components
│   │   │   ├── agents/       # Agent cards, catalog
│   │   │   └── layout/       # Sidebar, Header, etc.
│   │   ├── lib/              # Utilities, API client, hooks
│   │   ├── stores/           # Zustand stores
│   │   └── types/            # TypeScript types
│   ├── public/
│   ├── tailwind.config.ts
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI routers
│   │   │   ├── auth.py
│   │   │   ├── projects.py
│   │   │   ├── agents.py
│   │   │   └── chat.py
│   │   ├── core/             # Config, security, dependencies
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   │   ├── llm.py        # LLM gateway (multi-provider)
│   │   │   ├── coordinator.py # AI coordinator (idea → agents)
│   │   │   └── site_builder.py
│   │   └── main.py
│   ├── prompts/              # System prompts for each agent
│   ├── alembic/
│   ├── requirements.txt
│   └── pyproject.toml
├── docker-compose.yml
├── .env.example
├── docs/                     # Project documentation
├── tasks/                    # Task files for Claude Code
└── CLAUDE.md                 # THIS FILE
```

## Database Entities
- **User**: id (UUID), email, phone, is_verified, created_at, updated_at
- **Project**: id (UUID), user_id (FK), name, description, status (enum: draft/active/frozen/deleted), created_at
- **AgentTemplate**: id, type (enum), name, description, icon, base_price, capabilities (JSONB)
- **ProjectAgent**: id, project_id (FK), agent_template_id (FK), status (enum: active/paused), config (JSONB), created_at
- **ChatMessage**: id (UUID), project_id (FK), agent_type, role (user/assistant/system), content (text), metadata (JSONB), created_at
- **Subscription**: id, user_id (FK), plan (enum: free/basic/pro/ultra), status, current_period_start, current_period_end, created_at

## Agent Types (enum)
- `web_developer` — builds and deploys websites
- `designer` — logos, banners, creatives (image generation)
- `crm_manager` — CRM setup, sales funnels
- `support` — customer support chatbot
- `marketer` — content plans, ad copy, campaigns
- `seo` — SEO audit, keywords, meta tags
- `analyst` — analytics, reports, dashboards
- `coordinator` — meta-agent (idea analysis, agent recommendation)

## Design System
- **Accent color**: #F47B20 (orange)
- **Background**: white / #FAFAFA
- **Text**: #2D2D2D
- **Borders**: #E5E5E5
- **Font**: Inter (body), plus a display font for headings
- **Border radius**: 12px (cards), 8px (buttons/inputs)
- **Style**: Modern SaaS, clean, airy, no visual noise. Reference: Linear, Vercel, Notion

## Code Conventions
- TypeScript: strict mode, no `any`
- React: functional components only, hooks
- API responses: `{ data: T }` for success, `{ error: { code: string, message: string } }` for errors
- Backend: async everywhere, type hints required
- Naming: camelCase (TS), snake_case (Python)
- Error handling: try/catch with proper HTTP status codes
- Comments: only for complex logic, code should be self-documenting
- Each API endpoint has a Pydantic schema for request and response

## Important Notes
- All LLM calls go through `backend/app/services/llm.py` — NEVER call OpenAI directly from other modules
- System prompts for agents are in `backend/prompts/{agent_type}.md` — read these before modifying agent behavior
- Frontend API calls go through `frontend/src/lib/api.ts` — single source of truth for API client
- Auth middleware in `backend/app/core/security.py` — all protected routes use `get_current_user` dependency
- Environment variables in `.env` — never hardcode secrets
