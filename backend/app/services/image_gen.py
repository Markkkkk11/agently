import logging
import uuid
from pathlib import Path

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

STORAGE_DIR = Path("/storage")

# OpenRouter image generation model
IMAGE_MODEL = "openai/dall-e-3"


def _images_dir(project_id: uuid.UUID) -> Path:
    return STORAGE_DIR / str(project_id) / "images"


async def generate_image(
    project_id: uuid.UUID,
    prompt: str,
    filename: str | None = None,
) -> dict:
    """Generate an image via OpenRouter and save to project directory."""
    images_dir = _images_dir(project_id)
    images_dir.mkdir(parents=True, exist_ok=True)

    if not filename:
        existing = list(images_dir.glob("*.png"))
        idx = len(existing) + 1
        filename = f"image_{idx}.png"

    url = f"{settings.llm_api_base_url}/images/generations"
    headers = {
        "Authorization": f"Bearer {settings.llm_api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": settings.frontend_url,
        "X-Title": "AI Business Constructor",
    }
    payload = {
        "model": IMAGE_MODEL,
        "prompt": prompt,
        "n": 1,
        "size": "1024x1024",
        "response_format": "b64_json",
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()

        import base64
        b64 = data["data"][0]["b64_json"]
        image_bytes = base64.b64decode(b64)

        filepath = images_dir / filename
        filepath.write_bytes(image_bytes)

        logger.info("Image saved: %s for project %s", filename, project_id)
        return {
            "filename": filename,
            "path": f"/api/v1/projects/{project_id}/files/images/{filename}",
            "size": len(image_bytes),
        }
    except Exception as e:
        logger.error("Image generation failed: %s", e)
        raise


def list_images(project_id: uuid.UUID) -> list[dict]:
    """List all images in project directory."""
    images_dir = _images_dir(project_id)
    if not images_dir.exists():
        return []
    files = sorted(images_dir.glob("*"), key=lambda f: f.stat().st_mtime, reverse=True)
    return [
        {
            "filename": f.name,
            "path": f"/api/v1/projects/{project_id}/files/images/{f.name}",
            "size": f.stat().st_size,
        }
        for f in files
        if f.is_file()
    ]


def get_image_path(project_id: uuid.UUID, filename: str) -> Path | None:
    filepath = _images_dir(project_id) / filename
    if filepath.exists() and filepath.is_file():
        return filepath
    return None
