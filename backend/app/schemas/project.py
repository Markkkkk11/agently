import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.enums import AgentType, ProjectStatus


class ProjectCreate(BaseModel):
    description: str


class ProjectUpdate(BaseModel):
    name: str | None = None
    status: ProjectStatus | None = None


class AgentInfo(BaseModel):
    agent_type: AgentType
    name: str
    icon: str
    status: str
    task_completed: bool = False

    model_config = {"from_attributes": True}


class RecommendedAgentInfo(BaseModel):
    type: str
    reason: str


class ProjectResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    status: ProjectStatus
    agents: list[AgentInfo] = []
    agents_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}


class ProjectCreateResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    status: ProjectStatus
    recommended_agents: list[RecommendedAgentInfo] = []
    created_at: datetime


class AddAgentRequest(BaseModel):
    agent_type: AgentType
