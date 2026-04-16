import io
import logging
import re
import uuid
import zipfile
from pathlib import Path

logger = logging.getLogger(__name__)

STORAGE_DIR = Path("/storage")


def _site_dir(project_id: uuid.UUID) -> Path:
    return STORAGE_DIR / str(project_id) / "site"


def extract_html(text: str) -> str | None:
    pattern = r"```html\s*\n([\s\S]*?)```"
    match = re.search(pattern, text)
    if match:
        return match.group(1).strip()
    return None


async def save_site(project_id: uuid.UUID, html_content: str) -> str:
    site_dir = _site_dir(project_id)
    site_dir.mkdir(parents=True, exist_ok=True)

    index_path = site_dir / "index.html"
    index_path.write_text(html_content, encoding="utf-8")

    logger.info("Site saved for project %s", project_id)
    return f"/api/v1/projects/{project_id}/site"


async def get_site(project_id: uuid.UUID) -> str | None:
    index_path = _site_dir(project_id) / "index.html"
    if index_path.exists():
        return index_path.read_text(encoding="utf-8")
    return None


async def get_site_zip(project_id: uuid.UUID) -> bytes | None:
    index_path = _site_dir(project_id) / "index.html"
    if not index_path.exists():
        return None

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.write(index_path, "index.html")
    return buf.getvalue()
