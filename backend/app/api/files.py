import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.project import Project
from app.services.auth import verify_token
from app.services.image_gen import list_images, get_image_path

router = APIRouter(prefix="/projects/{project_id}/files", tags=["files"])

STORAGE_DIR = Path("/storage")


def _verify_user(token: str | None, db=None) -> uuid.UUID | None:
    if not token:
        return None
    return verify_token(token, token_type="access")


@router.get("/images")
async def get_project_images(
    project_id: uuid.UUID,
    token: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    user_id = _verify_user(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.user_id == user_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found")

    images = list_images(project_id)
    return {"data": images}


@router.get("/images/{filename}")
async def serve_image(
    project_id: uuid.UUID,
    filename: str,
    token: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    user_id = _verify_user(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.user_id == user_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found")

    filepath = get_image_path(project_id, filename)
    if not filepath:
        raise HTTPException(status_code=404, detail="Image not found")

    # Security: prevent path traversal
    if ".." in filename or "/" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    return FileResponse(filepath, media_type="image/png")


@router.get("")
async def list_project_files(
    project_id: uuid.UUID,
    token: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    """List all files in the project directory."""
    user_id = _verify_user(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.user_id == user_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found")

    project_dir = STORAGE_DIR / str(project_id)
    files = []

    if project_dir.exists():
        for f in project_dir.rglob("*"):
            if f.is_file():
                rel = f.relative_to(project_dir)
                files.append({
                    "path": str(rel),
                    "size": f.stat().st_size,
                    "url": f"/api/v1/projects/{project_id}/files/{rel}",
                })

    return {"data": files}
