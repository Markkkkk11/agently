import json
import logging
import re
import uuid
from collections.abc import AsyncGenerator
from pathlib import Path

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chat import ChatMessage
from app.models.enums import AgentType, MessageRole
from app.services.llm import chat_completion
from app.services.site_builder import extract_html, save_site
from app.services.image_gen import generate_image, list_images
from app.services.usage import check_limit, track_usage

logger = logging.getLogger(__name__)

PROMPTS_DIR = Path(__file__).resolve().parents[2] / "prompts"
STORAGE_DIR = Path("/storage")


def _load_agent_prompt(agent_type: str) -> str:
    path = PROMPTS_DIR / f"{agent_type}.md"
    if path.exists():
        return path.read_text(encoding="utf-8")
    return f"You are a helpful {agent_type} assistant."


def _get_project_files_context(project_id: uuid.UUID) -> str:
    """Build a context string describing all files in the project directory."""
    project_dir = STORAGE_DIR / str(project_id)
    if not project_dir.exists():
        return "\n[Директория проекта пуста — файлы ещё не созданы]"

    files = []
    for f in sorted(project_dir.rglob("*")):
        if f.is_file():
            rel = f.relative_to(project_dir)
            size_kb = f.stat().st_size / 1024
            files.append(f"  - {rel} ({size_kb:.1f} KB)")

    if not files:
        return "\n[Директория проекта пуста — файлы ещё не созданы]"

    return "\n## Файлы в директории проекта:\n" + "\n".join(files)


def _extract_image_prompts(text: str) -> list[dict]:
    """Extract image generation requests from designer's response.

    Format expected from designer:
    ```image
    prompt: A modern minimalist logo for tech startup
    filename: logo_v1.png
    ```
    """
    pattern = r"```image\s*\n([\s\S]*?)```"
    matches = re.findall(pattern, text)
    results = []
    for block in matches:
        prompt = ""
        filename = None
        for line in block.strip().split("\n"):
            line = line.strip()
            if line.lower().startswith("prompt:"):
                prompt = line[7:].strip()
            elif line.lower().startswith("filename:"):
                filename = line[9:].strip()
        if prompt:
            results.append({"prompt": prompt, "filename": filename})
    return results


async def get_history(
    db: AsyncSession,
    project_id: uuid.UUID,
    agent_type: AgentType,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[ChatMessage], int]:
    count_q = select(func.count()).select_from(ChatMessage).where(
        ChatMessage.project_id == project_id,
        ChatMessage.agent_type == agent_type,
    )
    total = (await db.execute(count_q)).scalar() or 0

    q = (
        select(ChatMessage)
        .where(
            ChatMessage.project_id == project_id,
            ChatMessage.agent_type == agent_type,
        )
        .order_by(ChatMessage.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    rows = (await db.execute(q)).scalars().all()
    return list(reversed(rows)), total


async def send_message(
    db: AsyncSession,
    project_id: uuid.UUID,
    agent_type: AgentType,
    content: str,
    user_id: uuid.UUID | None = None,
    model: str | None = None,
) -> AsyncGenerator[str, None]:
    # Check usage limit
    if user_id:
        within_limit = await check_limit(db, user_id)
        if not within_limit:
            yield f"data: {json.dumps({'type': 'error', 'content': 'Дневной лимит токенов исчерпан. Лимит обновится завтра.'})}\n\n"
            return

    # Save user message
    user_msg = ChatMessage(
        project_id=project_id,
        agent_type=agent_type,
        role=MessageRole.user,
        content=content,
    )
    db.add(user_msg)
    await db.flush()

    # Load context: system prompt + project files context + last 20 messages
    system_prompt = _load_agent_prompt(agent_type.value)

    # Add project files context so agent knows what's in the directory
    files_context = _get_project_files_context(project_id)
    system_prompt += "\n\n" + files_context

    # For designer, add info about existing images
    if agent_type == AgentType.designer:
        images = list_images(project_id)
        if images:
            system_prompt += "\n\n## Уже сгенерированные изображения:\n"
            for img in images:
                system_prompt += f"  - {img['filename']}\n"

    context_q = (
        select(ChatMessage)
        .where(
            ChatMessage.project_id == project_id,
            ChatMessage.agent_type == agent_type,
        )
        .order_by(ChatMessage.created_at.desc())
        .limit(20)
    )
    context_rows = (await db.execute(context_q)).scalars().all()
    context_rows = list(reversed(context_rows))

    messages = [{"role": "system", "content": system_prompt}]
    for msg in context_rows:
        messages.append({"role": msg.role.value, "content": msg.content})

    # Generate assistant message ID ahead of time
    assistant_msg_id = uuid.uuid4()

    # Yield start event
    yield f"data: {json.dumps({'type': 'start', 'message_id': str(assistant_msg_id)})}\n\n"

    full_content = ""

    try:
        result = await chat_completion(messages, model=model, stream=True)
        async for chunk in result:
            full_content += chunk
            yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
    except Exception as e:
        logger.warning("LLM streaming failed: %s. Using fallback.", e)
        fallback = _fallback_response(agent_type)
        full_content = fallback
        yield f"data: {json.dumps({'type': 'chunk', 'content': fallback})}\n\n"

    # Post-processing based on agent type
    site_updated = False
    images_generated = []

    # web_developer: extract HTML and save site
    if agent_type == AgentType.web_developer:
        html = extract_html(full_content)
        if html:
            await save_site(project_id, html)
            site_updated = True

    # designer: extract image prompts and generate images
    elif agent_type == AgentType.designer:
        image_requests = _extract_image_prompts(full_content)
        for req in image_requests:
            try:
                img_result = await generate_image(
                    project_id, req["prompt"], req.get("filename")
                )
                images_generated.append(img_result)
                yield f"data: {json.dumps({'type': 'image', 'image': img_result})}\n\n"
            except Exception as e:
                logger.error("Image generation failed: %s", e)
                yield f"data: {json.dumps({'type': 'chunk', 'content': f'\n\n⚠️ Не удалось сгенерировать изображение: {e}'})}\n\n"
                full_content += f"\n\n⚠️ Не удалось сгенерировать изображение: {e}"

    # Save assistant message
    metadata = {
        "tokens_used": len(full_content) // 4,
        "site_updated": site_updated,
        "images_generated": images_generated,
    }
    assistant_msg = ChatMessage(
        id=assistant_msg_id,
        project_id=project_id,
        agent_type=agent_type,
        role=MessageRole.assistant,
        content=full_content,
        metadata_=metadata,
    )
    db.add(assistant_msg)
    await db.commit()

    # Track usage
    if user_id:
        tokens_est = max(len(full_content) // 4, 1)
        await track_usage(db, user_id, tokens_est)

    # Yield end event
    yield f"data: {json.dumps({'type': 'end', 'content': full_content, 'metadata': metadata})}\n\n"


def _fallback_response(agent_type: AgentType) -> str:
    responses = {
        AgentType.web_developer: "Я веб-разработчик AI. Сейчас LLM-сервис недоступен, но я готов помочь вам с созданием сайта, как только соединение восстановится. Опишите, какой сайт вы хотите создать.",
        AgentType.designer: "Я дизайнер AI. Сейчас LLM-сервис недоступен, но я готов помочь вам с дизайном, как только соединение восстановится.",
        AgentType.marketer: "Я маркетолог AI. Сейчас LLM-сервис недоступен, но я готов помочь вам с маркетинговой стратегией, как только соединение восстановится.",
        AgentType.crm_manager: "Я CRM-менеджер AI. Сейчас LLM-сервис недоступен, но я готов помочь вам с настройкой CRM.",
        AgentType.support: "Я агент поддержки AI. Сейчас LLM-сервис недоступен, но я готов помочь вам с настройкой поддержки клиентов.",
        AgentType.seo: "Я SEO-специалист AI. Сейчас LLM-сервис недоступен, но я готов помочь вам с SEO-оптимизацией.",
        AgentType.analyst: "Я аналитик AI. Сейчас LLM-сервис недоступен, но я готов помочь вам с аналитикой и отчётами.",
    }
    return responses.get(agent_type, "Сервис временно недоступен. Попробуйте позже.")
