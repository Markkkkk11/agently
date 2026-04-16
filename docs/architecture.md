# Architecture Overview

## High-Level Architecture

```
[Browser/PWA] → [Next.js Frontend] → [API Gateway (FastAPI)]
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
              [Auth Service]        [Coordinator]           [Agent Runtime]
              (JWT + OTP)          (Idea → Agents)         (Chat + Tools)
                    │                       │                       │
                    └───────────────────────┼───────────────────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
              [PostgreSQL]             [Redis]              [LLM Gateway]
              (data + pgvector)     (cache, OTP,          (OpenAI, GigaChat,
                                    sessions)              YandexGPT, etc.)
```

## Request Flow

1. User sends message in agent chat
2. Frontend POST `/api/projects/{id}/agents/{type}/chat`
3. Backend loads: agent system prompt + last N messages (context window)
4. LLM Gateway selects provider based on user plan
5. Request sent to LLM API with streaming (SSE)
6. Response streamed back to frontend
7. Full response saved to ChatMessage table

## AI Coordinator Flow

1. User submits business idea (text)
2. Coordinator agent receives idea + system prompt
3. LLM analyzes and returns JSON: recommended agents + reasons
4. Frontend displays agent cards on workspace
5. User confirms/modifies selection
6. ProjectAgent records created in DB

## LLM Gateway (backend/app/services/llm.py)

Multi-provider support with fallback chain:
- Accepts: model name, messages, temperature, max_tokens
- Routes to correct provider API
- Supports streaming (SSE) and non-streaming
- Circuit breaker: if provider fails 3x → switch to fallback
- Token counting for usage limits

Provider priority by plan:
- Free/Basic: GigaChat Lite → YandexGPT Lite → Mistral 7B
- Pro: GPT-4o-mini → Claude Sonnet → GigaChat Pro
- Ultra: GPT-4o → Claude Opus → GigaChat Max

## File Storage

MVP: local filesystem at `./storage/{project_id}/`
Production: S3-compatible (Yandex Object Storage)

Structure:
```
storage/
└── {project_id}/
    ├── site/           # Generated site files (HTML, CSS, JS)
    ├── assets/         # Logos, banners, images
    ├── exports/        # Downloadable files
    └── chat_files/     # Files shared in chat
```
