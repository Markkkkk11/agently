import asyncio

from sqlalchemy import select

from app.core.database import async_session
from app.models.agent import AgentTemplate
from app.models.enums import AgentType

AGENT_TEMPLATES = [
    {
        "type": AgentType.web_developer,
        "name": "AI-разработчик сайта",
        "description": "Создание лендингов, многостраничных сайтов, e-commerce. Визуальный превью в реальном времени. Адаптивный дизайн, базовые SEO-теги.",
        "icon": "code",
        "base_price": 199000,
        "capabilities": [
            "Создание лендингов",
            "Многостраничные сайты",
            "E-commerce шаблоны",
            "Адаптивный дизайн",
            "SEO мета-теги",
        ],
        "system_prompt_file": "web_developer.md",
    },
    {
        "type": AgentType.designer,
        "name": "AI-дизайнер",
        "description": "Генерация логотипов, фирменного стиля, баннеров, рекламных креативов. Итеративная доработка.",
        "icon": "palette",
        "base_price": 149000,
        "capabilities": [
            "Логотипы",
            "Фирменный стиль",
            "Баннеры",
            "Рекламные креативы",
            "Несколько вариантов",
        ],
        "system_prompt_file": "designer.md",
    },
    {
        "type": AgentType.crm_manager,
        "name": "AI-менеджер / CRM",
        "description": "Настройка мини-CRM: контакты, сделки, воронка продаж. Интеграция с Bitrix24, amoCRM, Google Sheets.",
        "icon": "users",
        "base_price": 199000,
        "capabilities": [
            "Мини-CRM",
            "Воронка продаж",
            "Интеграция Bitrix24",
            "Интеграция amoCRM",
            "Google Sheets синхронизация",
        ],
        "system_prompt_file": "crm_manager.md",
    },
    {
        "type": AgentType.support,
        "name": "AI-поддержка клиентов",
        "description": "Настройка чат-бота поддержки для сайта, Telegram, WhatsApp. База знаний из FAQ, автоответы.",
        "icon": "headphones",
        "base_price": 99000,
        "capabilities": [
            "Чат-бот для сайта",
            "Telegram-бот",
            "База знаний",
            "Автоответы",
            "Маршрутизация запросов",
        ],
        "system_prompt_file": "support.md",
    },
    {
        "type": AgentType.marketer,
        "name": "AI-маркетолог",
        "description": "Контент-план, рекламные тексты, подбор ключевых слов, стратегия кампаний.",
        "icon": "megaphone",
        "base_price": 149000,
        "capabilities": [
            "Контент-план",
            "Рекламные тексты",
            "Ключевые слова",
            "Стратегия кампаний",
            "Аналитика эффективности",
        ],
        "system_prompt_file": "marketer.md",
    },
    {
        "type": AgentType.seo,
        "name": "AI-SEO-специалист",
        "description": "Аудит сайта, семантическое ядро, оптимизация мета-тегов, технический SEO.",
        "icon": "search",
        "base_price": 99000,
        "capabilities": [
            "SEO-аудит",
            "Семантическое ядро",
            "Мета-теги",
            "Технический SEO",
            "Мониторинг позиций",
        ],
        "system_prompt_file": "seo.md",
    },
    {
        "type": AgentType.analyst,
        "name": "AI-аналитик",
        "description": "Подключение Google Analytics / Яндекс.Метрика. Трафик, конверсии, отчёты и дашборды.",
        "icon": "bar-chart",
        "base_price": 99000,
        "capabilities": [
            "Google Analytics",
            "Яндекс.Метрика",
            "Отчёты и дашборды",
            "Трекинг конверсий",
            "Рекомендации",
        ],
        "system_prompt_file": "analyst.md",
    },
]


async def seed_agent_templates() -> None:
    async with async_session() as session:
        result = await session.execute(select(AgentTemplate))
        existing = result.scalars().all()

        if existing:
            print(f"Agent templates already seeded ({len(existing)} found). Skipping.")
            return

        for data in AGENT_TEMPLATES:
            session.add(AgentTemplate(**data))

        await session.commit()
        print(f"Seeded {len(AGENT_TEMPLATES)} agent templates.")


if __name__ == "__main__":
    asyncio.run(seed_agent_templates())
