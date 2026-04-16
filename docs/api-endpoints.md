# API Endpoints

Base URL: `/api/v1`

## Auth

### POST /auth/register
Request: `{ "email": "user@example.com" }` or `{ "phone": "+79001234567" }`
Response: `{ "data": { "message": "OTP sent", "expires_in": 300 } }`

### POST /auth/verify
Request: `{ "email": "user@example.com", "code": "123456" }`
Response: `{ "data": { "access_token": "jwt...", "refresh_token": "jwt...", "user": { "id": "uuid", "email": "..." } } }`

### POST /auth/refresh
Request: `{ "refresh_token": "jwt..." }`
Response: `{ "data": { "access_token": "jwt...", "refresh_token": "jwt..." } }`

---

## Projects (requires auth)

### GET /projects
Response: `{ "data": [{ "id": "uuid", "name": "...", "status": "active", "agents_count": 3, "created_at": "..." }] }`

### POST /projects
Request: `{ "description": "Хочу открыть интернет-магазин одежды в Москве" }`
Response: `{ "data": { "id": "uuid", "name": "Интернет-магазин одежды", "description": "...", "recommended_agents": [...] } }`
Note: AI coordinator generates name and recommends agents automatically.

### GET /projects/:id
Response: `{ "data": { "id": "uuid", "name": "...", "description": "...", "status": "...", "agents": [...], "created_at": "..." } }`

### PATCH /projects/:id
Request: `{ "name": "New name" }`
Response: `{ "data": { "id": "uuid", "name": "New name", ... } }`

### DELETE /projects/:id
Response: `{ "data": { "message": "Project deleted" } }`

---

## Agents

### GET /agents/catalog
Response: `{ "data": [{ "id": "uuid", "type": "web_developer", "name": "AI-разработчик сайта", "description": "...", "icon": "code", "base_price": 1990, "capabilities": [...] }] }`

### POST /projects/:id/agents
Request: `{ "agent_type": "web_developer" }`
Response: `{ "data": { "id": "uuid", "agent_type": "web_developer", "status": "active" } }`

### DELETE /projects/:id/agents/:agent_type
Response: `{ "data": { "message": "Agent removed" } }`

---

## Chat

### GET /projects/:id/agents/:agent_type/chat?limit=50&offset=0
Response: `{ "data": { "messages": [{ "id": "uuid", "role": "user", "content": "...", "created_at": "..." }, ...], "total": 120 } }`

### POST /projects/:id/agents/:agent_type/chat
Request: `{ "content": "Создай лендинг для магазина одежды" }`
Response: SSE stream
```
data: {"type": "start", "message_id": "uuid"}
data: {"type": "chunk", "content": "Отлично, давайте создадим"}
data: {"type": "chunk", "content": " лендинг для вашего магазина..."}
data: {"type": "end", "content": "full response text", "metadata": {"tokens_used": 1234}}
```

---

## User

### GET /me
Response: `{ "data": { "id": "uuid", "email": "...", "plan": "free", "projects_count": 1, "tokens_used_today": 12000, "tokens_limit": 50000 } }`

### PATCH /me
Request: `{ "name": "Иван Иванов" }`
Response: `{ "data": { ... } }`
