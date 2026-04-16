import random
import uuid
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.redis import redis_client
from app.models.user import User


def _otp_key(email: str) -> str:
    return f"otp:{email}"


async def generate_otp(email: str) -> str:
    code = f"{random.randint(0, 999999):06d}"
    await redis_client.setex(_otp_key(email), settings.otp_expire_seconds, code)
    return code


async def verify_otp(email: str, code: str) -> bool:
    key = _otp_key(email)
    stored = await redis_client.get(key)
    if stored is None or stored != code:
        return False
    await redis_client.delete(key)
    return True


def create_access_token(user_id: uuid.UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": str(user_id), "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_refresh_token(user_id: uuid.UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    payload = {"sub": str(user_id), "exp": expire, "type": "refresh"}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_tokens(user_id: uuid.UUID) -> tuple[str, str]:
    return create_access_token(user_id), create_refresh_token(user_id)


def verify_token(token: str, token_type: str = "access") -> uuid.UUID | None:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        if payload.get("type") != token_type:
            return None
        sub = payload.get("sub")
        if sub is None:
            return None
        return uuid.UUID(sub)
    except (JWTError, ValueError):
        return None


async def get_or_create_user(db: AsyncSession, email: str) -> User:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None:
        user = User(email=email, is_verified=True)
        db.add(user)
        await db.commit()
        await db.refresh(user)
    elif not user.is_verified:
        user.is_verified = True
        await db.commit()
        await db.refresh(user)
    return user
