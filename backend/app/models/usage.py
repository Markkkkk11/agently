import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDPrimaryKey


class UsageTracking(Base, UUIDPrimaryKey):
    __tablename__ = "usage_tracking"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)
    tokens_used: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    images_generated: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    requests_count: Mapped[int] = mapped_column(Integer, default=0, server_default="0")

    user = relationship("User", back_populates="usage_records")

    __table_args__ = (
        UniqueConstraint("user_id", "date", name="uq_usage_user_date"),
    )
