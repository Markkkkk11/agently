import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDPrimaryKey
from app.models.enums import AgentStatus, AgentType


class AgentTemplate(Base, UUIDPrimaryKey):
    __tablename__ = "agent_templates"

    type: Mapped[AgentType] = mapped_column(
        Enum(AgentType, name="agent_type", create_constraint=True), unique=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    icon: Mapped[str] = mapped_column(String(50), nullable=False)
    base_price: Mapped[int] = mapped_column(Integer, nullable=False)
    capabilities: Mapped[dict] = mapped_column(JSONB, nullable=False, default=list)
    system_prompt_file: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")


class ProjectAgent(Base, UUIDPrimaryKey):
    __tablename__ = "project_agents"

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    agent_template_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("agent_templates.id"), nullable=False
    )
    agent_type: Mapped[AgentType] = mapped_column(
        Enum(AgentType, name="agent_type", create_constraint=True, create_type=False), nullable=False
    )
    status: Mapped[AgentStatus] = mapped_column(
        Enum(AgentStatus, name="agent_status", create_constraint=True),
        default=AgentStatus.active,
        server_default="active",
    )
    task_completed: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    config: Mapped[dict | None] = mapped_column(JSONB, nullable=True, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    project = relationship("Project", back_populates="agents")
    template = relationship("AgentTemplate")

    __table_args__ = (
        UniqueConstraint("project_id", "agent_type", name="uq_project_agent_type"),
    )
