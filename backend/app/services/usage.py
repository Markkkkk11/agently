import uuid
from datetime import date, timedelta

from sqlalchemy import select, update, func
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import PlanType
from app.models.subscription import Subscription
from app.models.usage import UsageTracking

PLAN_LIMITS: dict[PlanType, dict[str, int]] = {
    PlanType.free: {"tokens_per_day": 10_000, "images_per_day": 3, "max_projects": 5},
    PlanType.basic: {"tokens_per_day": 50_000, "images_per_day": 10, "max_projects": 15},
    PlanType.pro: {"tokens_per_day": 200_000, "images_per_day": 50, "max_projects": 50},
    PlanType.ultra: {"tokens_per_day": 500_000, "images_per_day": 200, "max_projects": 200},
}


async def _get_user_plan(db: AsyncSession, user_id: uuid.UUID) -> PlanType:
    result = await db.execute(
        select(Subscription.plan)
        .where(Subscription.user_id == user_id, Subscription.status == "active")
        .order_by(Subscription.created_at.desc())
        .limit(1)
    )
    plan = result.scalar_one_or_none()
    return plan or PlanType.free


async def track_usage(
    db: AsyncSession,
    user_id: uuid.UUID,
    tokens_used: int,
    images_generated: int = 0,
) -> None:
    today = date.today()
    stmt = insert(UsageTracking).values(
        user_id=user_id,
        date=today,
        tokens_used=tokens_used,
        images_generated=images_generated,
        requests_count=1,
    )
    stmt = stmt.on_conflict_do_update(
        constraint="uq_usage_user_date",
        set_={
            "tokens_used": UsageTracking.tokens_used + tokens_used,
            "images_generated": UsageTracking.images_generated + images_generated,
            "requests_count": UsageTracking.requests_count + 1,
        },
    )
    await db.execute(stmt)
    await db.commit()


async def get_usage(
    db: AsyncSession, user_id: uuid.UUID, target_date: date | None = None
) -> dict:
    target_date = target_date or date.today()
    result = await db.execute(
        select(UsageTracking).where(
            UsageTracking.user_id == user_id,
            UsageTracking.date == target_date,
        )
    )
    row = result.scalar_one_or_none()

    plan = await _get_user_plan(db, user_id)
    limits = PLAN_LIMITS[plan]

    return {
        "date": str(target_date),
        "plan": plan.value,
        "tokens_used": row.tokens_used if row else 0,
        "tokens_limit": limits["tokens_per_day"],
        "images_used": row.images_generated if row else 0,
        "images_limit": limits["images_per_day"],
        "requests_count": row.requests_count if row else 0,
        "max_projects": limits["max_projects"],
    }


async def get_usage_history(
    db: AsyncSession, user_id: uuid.UUID, days: int = 7
) -> list[dict]:
    today = date.today()
    start = today - timedelta(days=days - 1)

    result = await db.execute(
        select(UsageTracking)
        .where(
            UsageTracking.user_id == user_id,
            UsageTracking.date >= start,
        )
        .order_by(UsageTracking.date)
    )
    rows = {r.date: r for r in result.scalars().all()}

    history = []
    for i in range(days):
        d = start + timedelta(days=i)
        row = rows.get(d)
        history.append({
            "date": str(d),
            "tokens_used": row.tokens_used if row else 0,
            "images_generated": row.images_generated if row else 0,
            "requests_count": row.requests_count if row else 0,
        })
    return history


async def check_limit(db: AsyncSession, user_id: uuid.UUID) -> bool:
    usage = await get_usage(db, user_id)
    return usage["tokens_used"] < usage["tokens_limit"]


async def check_project_limit(db: AsyncSession, user_id: uuid.UUID) -> tuple[bool, int]:
    """Returns (allowed, max_projects) — whether user can create another project."""
    from app.models.project import Project
    from app.models.enums import ProjectStatus

    plan = await _get_user_plan(db, user_id)
    max_projects = PLAN_LIMITS[plan]["max_projects"]

    result = await db.execute(
        select(func.count())
        .select_from(Project)
        .where(Project.user_id == user_id, Project.status != ProjectStatus.deleted)
    )
    count = result.scalar() or 0
    return count < max_projects, max_projects
