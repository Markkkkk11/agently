from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.usage import get_usage, get_usage_history

router = APIRouter(tags=["usage"])


@router.get("/usage")
async def current_usage(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await get_usage(db, user.id)
    return {"data": data}


@router.get("/usage/history")
async def usage_history(
    days: int = Query(default=7, le=30, ge=1),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await get_usage_history(db, user.id, days)
    return {"data": data}
