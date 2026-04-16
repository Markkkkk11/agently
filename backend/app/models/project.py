import uuid

from sqlalchemy import Enum, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKey
from app.models.enums import ProjectStatus


class Project(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "projects"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[ProjectStatus] = mapped_column(
        Enum(ProjectStatus, name="project_status", create_constraint=True),
        default=ProjectStatus.active,
        server_default="active",
    )

    user = relationship("User", back_populates="projects")
    agents = relationship("ProjectAgent", back_populates="project", cascade="all, delete-orphan")
    messages = relationship("ChatMessage", back_populates="project", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_projects_user_status", "user_id", "status"),
    )
