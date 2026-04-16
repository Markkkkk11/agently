import json
import logging
from pathlib import Path

from pydantic import BaseModel

from app.services.llm import chat_completion

logger = logging.getLogger(__name__)

PROMPTS_DIR = Path(__file__).resolve().parents[2] / "prompts"


class RecommendedAgent(BaseModel):
    type: str
    reason: str


class CoordinatorResponse(BaseModel):
    project_name: str
    summary: str
    recommended_agents: list[RecommendedAgent]


def _load_system_prompt() -> str:
    return (PROMPTS_DIR / "coordinator.md").read_text(encoding="utf-8")


async def analyze_idea(description: str) -> CoordinatorResponse:
    system_prompt = _load_system_prompt()

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": description},
    ]

    try:
        raw = await chat_completion(messages, temperature=0.4, max_tokens=1500)
        # Strip markdown code fences if present
        text = raw.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        data = json.loads(text)
        return CoordinatorResponse(**data)

    except Exception as e:
        logger.warning("Coordinator LLM call failed: %s. Using fallback.", e)
        return _fallback_response(description)


def _fallback_response(description: str) -> CoordinatorResponse:
    words = description.strip().split()
    name = " ".join(words[:4]) if len(words) >= 4 else description[:40]

    return CoordinatorResponse(
        project_name=name,
        summary=f"Бизнес-проект: {description[:100]}",
        recommended_agents=[
            RecommendedAgent(type="web_developer", reason="Сайт — основа присутствия в интернете"),
            RecommendedAgent(type="designer", reason="Фирменный стиль для узнаваемости бренда"),
            RecommendedAgent(type="marketer", reason="Привлечение клиентов через контент и рекламу"),
        ],
    )
