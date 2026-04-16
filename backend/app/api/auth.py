from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.auth import RegisterRequest, RefreshRequest, TokenResponse, VerifyRequest
from app.services.auth import (
    create_tokens,
    generate_otp,
    get_or_create_user,
    verify_otp,
    verify_token,
    create_access_token,
    create_refresh_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register(body: RegisterRequest):
    code = await generate_otp(body.email)
    # MVP: return OTP in response. Production: send via email.
    return {"data": {"message": "OTP sent", "expires_in": 300, "otp_code": code}}


@router.post("/verify", response_model=dict)
async def verify(body: VerifyRequest, db: AsyncSession = Depends(get_db)):
    valid = await verify_otp(body.email, body.code)
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "invalid_otp", "message": "Invalid or expired OTP code"},
        )

    user = await get_or_create_user(db, body.email)
    access_token, refresh_token = create_tokens(user.id)

    return {
        "data": {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": str(user.id),
                "email": user.email,
                "phone": user.phone,
                "name": user.name,
                "is_verified": user.is_verified,
                "plan": getattr(user, "plan", "free"),
                "tokens_used_today": 0,
                "tokens_limit": 10000,
                "images_used_today": 0,
                "images_limit": 5,
            },
        }
    }


@router.post("/refresh", response_model=dict)
async def refresh(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    user_id = verify_token(body.refresh_token, token_type="refresh")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "invalid_refresh_token", "message": "Invalid or expired refresh token"},
        )

    access_token = create_access_token(user_id)
    new_refresh_token = create_refresh_token(user_id)

    return {
        "data": {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
        }
    }
