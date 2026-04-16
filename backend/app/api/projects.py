import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.enums import AgentType, ProjectStatus
from app.models.project import Project
from app.models.agent import ProjectAgent, AgentTemplate
from app.models.user import User
from app.schemas.project import (
    ProjectCreate,
    ProjectCreateResponse,
    ProjectResponse,
    ProjectUpdate,
    AgentInfo,
    RecommendedAgentInfo,
)
from app.services.coordinator import analyze_idea
from app.services.usage import check_project_limit

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", response_model=dict)
async def create_project(
    body: ProjectCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    allowed, max_projects = await check_project_limit(db, user.id)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "project_limit_reached",
                "message": f"Достигнут лимит проектов ({max_projects}). Обновите тариф для увеличения лимита.",
            },
        )

    result = await analyze_idea(body.description)

    project = Project(
        user_id=user.id,
        name=result.project_name,
        description=body.description,
        status=ProjectStatus.active,
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)

    # Auto-add recommended agents
    added_agents = []
    for rec in result.recommended_agents:
        try:
            agent_type = AgentType(rec.type)
        except ValueError:
            continue
        tmpl_result = await db.execute(
            select(AgentTemplate).where(AgentTemplate.type == agent_type)
        )
        template = tmpl_result.scalar_one_or_none()
        if not template:
            continue
        # Check not already added
        existing = await db.execute(
            select(ProjectAgent).where(
                ProjectAgent.project_id == project.id,
                ProjectAgent.agent_type == agent_type,
            )
        )
        if existing.scalar_one_or_none():
            continue
        agent = ProjectAgent(
            project_id=project.id,
            agent_template_id=template.id,
            agent_type=agent_type,
        )
        db.add(agent)
        added_agents.append(rec)

    if added_agents:
        await db.commit()

    return {
        "data": ProjectCreateResponse(
            id=project.id,
            name=project.name,
            description=project.description,
            status=project.status,
            recommended_agents=[
                RecommendedAgentInfo(type=a.type, reason=a.reason)
                for a in result.recommended_agents
            ],
            created_at=project.created_at,
        ).model_dump(mode="json")
    }


@router.get("", response_model=dict)
async def list_projects(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Project)
        .where(Project.user_id == user.id, Project.status != ProjectStatus.deleted)
        .options(selectinload(Project.agents))
        .order_by(Project.created_at.desc())
    )
    result = await db.execute(stmt)
    projects = result.scalars().all()

    data = []
    for p in projects:
        data.append({
            "id": str(p.id),
            "name": p.name,
            "description": p.description,
            "status": p.status.value,
            "agents_count": len(p.agents),
            "created_at": p.created_at.isoformat(),
        })

    return {"data": data}


@router.get("/{project_id}", response_model=dict)
async def get_project(
    project_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Project)
        .where(Project.id == project_id, Project.user_id == user.id)
        .options(selectinload(Project.agents).selectinload(ProjectAgent.template))
    )
    result = await db.execute(stmt)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail={"code": "not_found", "message": "Project not found"})

    agents = [
        {
            "agent_type": a.agent_type.value,
            "name": a.template.name if a.template else a.agent_type.value,
            "icon": a.template.icon if a.template else "",
            "status": a.status.value,
            "task_completed": a.task_completed,
        }
        for a in project.agents
    ]

    return {
        "data": {
            "id": str(project.id),
            "name": project.name,
            "description": project.description,
            "status": project.status.value,
            "agents": agents,
            "agents_count": len(agents),
            "created_at": project.created_at.isoformat(),
        }
    }


@router.patch("/{project_id}", response_model=dict)
async def update_project(
    project_id: uuid.UUID,
    body: ProjectUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Project).where(Project.id == project_id, Project.user_id == user.id)
    result = await db.execute(stmt)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail={"code": "not_found", "message": "Project not found"})

    if body.name is not None:
        project.name = body.name
    if body.status is not None:
        project.status = body.status

    await db.commit()
    await db.refresh(project)

    return {
        "data": {
            "id": str(project.id),
            "name": project.name,
            "description": project.description,
            "status": project.status.value,
            "created_at": project.created_at.isoformat(),
        }
    }


@router.delete("/{project_id}", response_model=dict)
async def delete_project(
    project_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Project).where(Project.id == project_id, Project.user_id == user.id)
    result = await db.execute(stmt)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail={"code": "not_found", "message": "Project not found"})

    project.status = ProjectStatus.deleted
    await db.commit()

    return {"data": {"message": "Project deleted"}}
