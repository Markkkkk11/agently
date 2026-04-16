import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.agent import ProjectAgent
from app.models.enums import AgentType
from app.models.project import Project
from app.models.user import User
from app.schemas.chat import ChatHistoryResponse, ChatMessageResponse, SendMessageRequest
from app.services.chat import get_history, send_message

router = APIRouter(prefix="/projects/{project_id}/agents/{agent_type}", tags=["chat"])


async def _verify_project_agent(
    project_id: uuid.UUID,
    agent_type: AgentType,
    user: User,
    db: AsyncSession,
) -> Project:
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.user_id == user.id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"code": "not_found", "message": "Project not found"})

    agent_result = await db.execute(
        select(ProjectAgent).where(
            ProjectAgent.project_id == project_id,
            ProjectAgent.agent_type == agent_type,
        )
    )
    if not agent_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"code": "agent_not_found", "message": "Agent not connected to project"})

    return project


@router.post("/chat")
async def post_chat_message(
    project_id: uuid.UUID,
    agent_type: AgentType,
    body: SendMessageRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _verify_project_agent(project_id, agent_type, user, db)

    return StreamingResponse(
        send_message(db, project_id, agent_type, body.content, user_id=user.id, model=body.model),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/chat")
async def get_chat_history(
    project_id: uuid.UUID,
    agent_type: AgentType,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _verify_project_agent(project_id, agent_type, user, db)

    messages, total = await get_history(db, project_id, agent_type, limit, offset)

    return {
        "data": ChatHistoryResponse(
            messages=[ChatMessageResponse.model_validate(m) for m in messages],
            total=total,
        )
    }
