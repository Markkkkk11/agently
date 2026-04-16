from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.usage import get_usage

router = APIRouter(tags=["users"])


class UpdateProfileRequest(BaseModel):
    name: str | None = None
    phone: str | None = None


@router.get("/me")
async def get_me(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    usage = await get_usage(db, user.id)

    return {
        "data": {
            "id": str(user.id),
            "email": user.email,
            "phone": user.phone,
            "name": user.name,
            "is_verified": user.is_verified,
            "plan": usage["plan"],
            "tokens_used_today": usage["tokens_used"],
            "tokens_limit": usage["tokens_limit"],
            "images_used_today": usage["images_used"],
            "images_limit": usage["images_limit"],
        }
    }


@router.patch("/me")
async def update_me(
    body: UpdateProfileRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.name is not None:
        user.name = body.name
    if body.phone is not None:
        user.phone = body.phone

    await db.commit()
    await db.refresh(user)

    return {
        "data": {
            "id": str(user.id),
            "email": user.email,
            "phone": user.phone,
            "name": user.name,
        }
    }
