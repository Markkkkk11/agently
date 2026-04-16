# AI Agents Catalog

## Overview
Each agent is a backend service with:
- A system prompt (in `prompts/{type}.md`)
- A set of tools/capabilities
- Its own chat context per project
- Ability to communicate with other agents via event bus (Phase 2)

## Agent Types

### web_developer
- **Name**: AI-разработчик сайта
- **Icon**: code
- **Price**: 1990 ₽/мес
- **Capabilities**: Create landing pages, multi-page sites, e-commerce layouts. Visual preview in real-time. Handle commands like "add testimonials block", "change button color to orange". Responsive design, basic SEO meta tags, SSL.
- **Tools**: HTML/CSS/JS generation, template library, image placement
- **User needs**: business description, texts, photos (optional), design preferences

### designer
- **Name**: AI-дизайнер
- **Icon**: palette
- **Price**: 1490 ₽/мес
- **Capabilities**: Generate logos, brand identity, banners, ad creatives. Multiple variants, iterative refinement. Supports styles: minimalism, hi-tech, playful, corporate.
- **Tools**: Image generation API (Stable Diffusion / DALL-E / Kandinsky)
- **User needs**: style description, colors, mood, examples

### crm_manager
- **Name**: AI-менеджер / CRM
- **Icon**: users
- **Price**: 1990 ₽/мес
- **Capabilities**: Set up built-in mini-CRM (contacts, deals, sales funnel). Integration with Bitrix24, amoCRM via API. Google Sheets sync. Basic 1C integration (Phase 2).
- **Tools**: CRM CRUD, API connectors, data import/export
- **User needs**: CRM choice, business processes description, API keys (for external CRM)

### support
- **Name**: AI-поддержка клиентов
- **Icon**: headphones
- **Price**: 990 ₽/мес
- **Capabilities**: Set up customer support chatbot (website widget, Telegram, WhatsApp). Build knowledge base from FAQ. Auto-responses, routing complex queries. Integration with CRM for order status queries.
- **Tools**: Bot builder, knowledge base, channel connectors
- **User needs**: FAQ, typical questions/answers, channel access

### marketer
- **Name**: AI-маркетолог
- **Icon**: megaphone
- **Price**: 1490 ₽/мес
- **Capabilities**: Content plan generation (posts, articles, stories). Ad copy writing. Keyword research. Campaign strategy. Performance recommendations.
- **Tools**: Content generator, keyword tools, social media templates
- **User needs**: goals, budget, target audience, tone of voice

### seo
- **Name**: AI-SEO-специалист
- **Icon**: search
- **Price**: 990 ₽/мес
- **Capabilities**: Site audit, semantic core, meta tags optimization, technical SEO (speed, mobile). Keyword implementation. Position monitoring.
- **Tools**: SEO analyzer, keyword researcher, meta tag generator
- **User needs**: target keywords, competitors, site access

### analyst
- **Name**: AI-аналитик
- **Icon**: bar-chart
- **Price**: 990 ₽/мес
- **Capabilities**: Connect Google Analytics / Yandex.Metrica. Track traffic, conversions, leads. Build reports and dashboards. Answer questions like "How many leads this week?"
- **Tools**: Analytics API connectors, chart generator, report builder
- **User needs**: analytics service access, goals definition
