"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Reveal, { RevealGroup } from "@/components/ui/Reveal";

const PROMPTS = [
  "Собери сайт для студии интерьеров с заявками и CRM",
  "Запусти интернет-магазин косметики с каталогом и оплатой",
  "Создай портал записи клиентов с напоминаниями",
  "Сделай дашборд продаж и задачи для команды",
];

const STARTERS = [
  "Лендинг услуг",
  "Интернет-магазин",
  "Клиентский портал",
  "CRM-воронка",
  "Дашборд продаж",
];

const HERO_MARKS = ["WEB", "CRM", "SEO", "ADS", "DATA"];

const FEATURE_STORIES = [
  {
    num: "01",
    title: "Создавайте со скоростью мысли",
    desc: "Опишите идею, и Agently превратит ее в рабочий проект: структуру страниц, сценарии пользователей, тексты, формы и первые интеграции.",
    visual: "tasks",
    tone: "dark",
  },
  {
    num: "02",
    title: "Бизнес-логика собирается вместе с вами",
    desc: "Пока вы уточняете задачу, агенты готовят CRM, данные, роли, автоматизации и контент, чтобы запуск был связанным, а не набором разрозненных файлов.",
    visual: "backend",
    tone: "warm",
  },
  {
    num: "03",
    title: "Готово к использованию сразу",
    desc: "Получайте опубликованный сайт, понятные заявки, аналитику и материалы для продвижения без долгого перехода от макета к реальной работе.",
    visual: "launch",
    tone: "yellow",
  },
  {
    num: "04",
    title: "Одна платформа. Любой агент.",
    desc: "Подключайте разработчика, дизайнера, маркетолога, SEO, поддержку и аналитика в одном рабочем пространстве. Система сама держит контекст.",
    visual: "models",
    tone: "violet",
  },
];

const AGENTS = [
  { code: "WD", name: "Веб-разработчик", desc: "Сайты, лендинги, формы и публикация" },
  { code: "DS", name: "Дизайнер", desc: "Айдентика, баннеры и визуальная система" },
  { code: "MK", name: "Маркетолог", desc: "Контент, офферы, реклама и тексты" },
  { code: "CR", name: "CRM-менеджер", desc: "Воронки, сделки и клиентские сценарии" },
  { code: "SP", name: "Поддержка", desc: "Ответы клиентам и база знаний" },
  { code: "SE", name: "SEO-специалист", desc: "Аудит, семантика и оптимизация" },
  { code: "AN", name: "Аналитик", desc: "Метрики, отчеты и дашборды" },
];

const PRICING = [
  {
    name: "Basic",
    price: "990",
    period: "/мес",
    features: ["50 000 токенов/день", "10 изображений/день", "Все агенты", "Email-поддержка"],
    cta: "Попробовать",
    popular: false,
  },
  {
    name: "Pro",
    price: "2 490",
    period: "/мес",
    features: ["200 000 токенов/день", "50 изображений/день", "Все агенты", "Приоритетная поддержка", "Свой домен"],
    cta: "Выбрать Pro",
    popular: true,
  },
  {
    name: "Ultra",
    price: "4 990",
    period: "/мес",
    features: ["500 000 токенов/день", "200 изображений/день", "Все агенты", "Персональный менеджер", "API-доступ", "White label"],
    cta: "Выбрать Ultra",
    popular: false,
  },
];

const TESTIMONIALS = [
  {
    name: "Алексей К.",
    role: "Основатель интернет-магазина",
    text: "Запустил магазин за 2 дня вместо двух месяцев. AI-разработчик сделал сайт, дизайнер - логотип, маркетолог - первую рекламную кампанию.",
  },
  {
    name: "Мария С.",
    role: "Владелица кофейни",
    text: "Раньше я тратила тысячи на фрилансеров. Теперь один сервис заменяет целый штат и работает 24/7.",
  },
  {
    name: "Дмитрий В.",
    role: "Стартап-фаундер",
    text: "Идеально для MVP. Описал идею и получил сайт, CRM и маркетинговый план за один вечер.",
  },
];

const FAQ_ITEMS = [
  { q: "Что такое AI-агент?", a: "AI-агент - это виртуальный специалист, который решает конкретные бизнес-задачи через чат. Каждый агент обучен на узкой области: веб-разработка, дизайн, маркетинг и т.д." },
  { q: "Нужны ли технические знания?", a: "Нет. Вы описываете задачу обычным языком, а агент выполняет техническую часть и показывает результат по шагам." },
  { q: "Могу ли я подключить свой домен?", a: "Да, на тарифах Pro и Ultra можно привязать собственный домен к сгенерированному сайту." },
  { q: "Как работает бесплатный тариф?", a: "Бесплатный тариф включает 10 000 токенов в день и 3 изображения. Этого достаточно, чтобы попробовать платформу и создать первый проект." },
  { q: "Какие LLM используются?", a: "Платформа поддерживает несколько провайдеров: OpenAI, Anthropic, GigaChat, YandexGPT. Вы можете выбрать оптимальный вариант в настройках." },
  { q: "Можно ли экспортировать результаты?", a: "Да. Сайты скачиваются в виде HTML/ZIP, тексты и планы доступны для копирования, а отчеты экспортируются в популярных форматах." },
];

const FOOTER_COLUMNS = [
  {
    title: "Компания",
    links: ["О нас", "Контакты", "Карьера", "Партнеры"],
  },
  {
    title: "Продукт",
    links: ["Агенты", "Сайты", "CRM", "Тарифы", "API"],
  },
  {
    title: "Ресурсы",
    links: ["Документация", "Блог", "Сообщество", "Шаблоны"],
  },
  {
    title: "Правовая информация",
    links: ["Конфиденциальность", "Оферта", "Безопасность", "Доступность"],
  },
];

export default function LandingPage() {
  useHeroScrollGradient();

  return (
    <div className="min-h-screen [overflow-x:clip] bg-[#f7f7f4] text-[#050505]">
      <header className="sticky top-0 z-50 h-16 border-b border-black/[0.04] bg-[#f7f7f4]/82 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-[1920px] items-center justify-between px-5 lg:px-10">
          <Link href="/" className="flex items-center gap-2" aria-label="Agently home">
            <LogoMark />
            <span className="text-[17px] font-extrabold leading-none tracking-[-0.02em]">Agently</span>
          </Link>

          <nav className="hidden items-center gap-8 text-[14px] font-medium text-black/80 md:flex">
            <a href="#how" className="inline-flex items-center gap-1 transition hover:text-black">
              Продукт <ChevronDown />
            </a>
            <a href="#agents" className="inline-flex items-center gap-1 transition hover:text-black">
              Кейсы <ChevronDown />
            </a>
            <a href="#faq" className="inline-flex items-center gap-1 transition hover:text-black">
              Ресурсы <ChevronDown />
            </a>
            <a href="#pricing" className="transition hover:text-black">Тарифы</a>
            <Link href="/login" className="transition hover:text-black">Войти</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              aria-label="Сменить язык"
              className="hidden h-8 w-8 place-items-center rounded-full text-black transition hover:bg-black/5 sm:grid"
            >
              <GlobeIcon />
            </button>
            <Link
              href="/login"
              className="rounded-full bg-black px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_12px_30px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5 hover:bg-black/82"
            >
              Контакт
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-sky relative min-h-[calc(100svh-64px)] overflow-hidden px-5 pb-10 pt-14 text-center sm:px-6 lg:pt-[72px]">
          <div className="hero-gradient-field" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(to_bottom,rgba(247,247,244,0.96),rgba(247,247,244,0))]" />
          <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center">
            <Reveal direction="up">
              <Link
                href="/login"
                className="mb-8 inline-flex items-center rounded-full border border-black/[0.06] bg-white/44 px-3 py-2 text-[13px] font-semibold text-black/76 shadow-[0_18px_50px_rgba(40,44,50,0.06)] backdrop-blur-2xl transition hover:bg-white/70"
              >
                <span className="mr-2 rounded-full bg-black px-3 py-1 text-[11px] font-bold uppercase tracking-[0.02em] text-white">
                  AI
                </span>
                Команда для запуска бизнеса
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Reveal>

            <Reveal direction="up" delay={100}>
              <p className="text-[18px] font-semibold tracking-[-0.03em] text-black sm:text-[22px]">
                Улучшите ваш
              </p>
              <h1 className="mt-3 max-w-6xl text-[62px] font-normal leading-[0.9] tracking-[-0.065em] text-black sm:text-[96px] lg:text-[124px] xl:text-[138px]">
                Бизнес
              </h1>
              <p className="mt-5 text-[22px] font-semibold tracking-[-0.04em] text-black sm:text-[32px]">
                с AI-командой
              </p>
            </Reveal>

            <Reveal direction="up" delay={190}>
              <p className="mt-7 max-w-[560px] text-[15px] font-medium leading-[1.38] tracking-[-0.01em] text-black/62 sm:text-[16px]">
                Сайт, дизайн, CRM, маркетинг и поддержка в одном интерфейсе. Опишите идею, а агенты соберут рабочий запуск.
              </p>
            </Reveal>

            <Reveal direction="up" delay={280} className="mt-10 w-full max-w-[760px]">
              <PromptComposer />
            </Reveal>

            <Reveal direction="up" delay={360}>
              <div className="mt-9 w-full">
                <p className="mb-5 text-[12px] font-bold uppercase tracking-[0.16em] text-black/34">
                  Популярные направления
                </p>
                <div className="mx-auto flex max-w-[680px] flex-wrap items-center justify-center gap-x-10 gap-y-4">
                  {HERO_MARKS.map((mark) => (
                    <span key={mark} className="text-[22px] font-extrabold tracking-[-0.06em] text-black/68 sm:text-[28px]">
                      {mark.toLowerCase()}
                    </span>
                  ))}
                </div>
                <div className="mx-auto mt-6 flex max-w-[620px] flex-wrap justify-center gap-2">
                  {STARTERS.slice(0, 4).map((starter) => (
                    <Link
                      href="/login"
                      key={starter}
                      className="rounded-full border border-black/[0.06] bg-white/38 px-4 py-2 text-[13px] font-semibold text-black/70 shadow-[0_14px_36px_rgba(30,42,48,0.04)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/72 hover:text-black"
                    >
                      {starter}
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <LimitlessBridge />
        <ProductStoryStack />

        <section id="agents" className="agents-section relative bg-white px-5 py-24 sm:px-6 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <div className="agents-board">
                <article className="agents-intro-panel">
                  <p className="agents-kicker">AI-команда</p>
                  <h2>Каждый агент берет свою часть запуска</h2>
                  <p>
                    Вы общаетесь в одном интерфейсе, а внутри задачи расходятся между специалистами.
                  </p>
                  <div className="agents-orbit" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </article>

                <div className="agents-grid-panel">
                  <RevealGroup stagger={70} className="agents-grid">
                    {AGENTS.map((agent) => (
                      <article key={agent.name} className="agent-tile">
                        <div className="agent-code">{agent.code}</div>
                        <div>
                          <h3>{agent.name}</h3>
                          <p>{agent.desc}</p>
                        </div>
                      </article>
                    ))}
                  </RevealGroup>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="pricing" className="relative overflow-hidden bg-[#f7f7f4] px-5 py-24 sm:px-6 lg:py-32">
          <div className="pricing-gradient" aria-hidden="true" />
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div className="mb-12 text-center">
                <h2 className="text-[44px] font-normal leading-[1.03] tracking-[-0.035em] sm:text-[64px]">
                  Тарифы под разный темп
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-[18px] text-black/60">
                  Начните бесплатно, а когда появится поток задач, расширьте лимиты.
                </p>
              </div>
            </Reveal>

            <RevealGroup stagger={110} className="grid gap-4 md:grid-cols-3">
              {PRICING.map((plan) => (
                <article
                  key={plan.name}
                  className={`relative rounded-[8px] border p-7 ${
                    plan.popular
                      ? "border-black bg-white shadow-[0_24px_70px_rgba(20,44,52,0.12)]"
                      : "border-black/[0.06] bg-white/62 backdrop-blur-xl"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute right-5 top-5 rounded-full bg-[#f4b9d8] px-3 py-1 text-[12px] font-bold uppercase tracking-[0.06em]">
                      Популярный
                    </span>
                  )}
                  <h3 className="text-[24px] font-semibold tracking-[-0.02em]">{plan.name}</h3>
                  <div className="mt-8 flex items-end gap-2">
                    <span className="text-[52px] font-normal leading-none tracking-[-0.04em]">{plan.price}</span>
                    <span className="pb-1 text-[17px] text-black/50">₽{plan.period}</span>
                  </div>
                  <ul className="mt-8 space-y-3 border-t border-black/10 pt-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-[15px] text-black/68">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#8adfff]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login"
                    className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-[14px] font-bold transition ${
                      plan.popular ? "bg-black text-white hover:bg-black/82" : "border border-black/12 bg-white/70 hover:bg-white"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </article>
              ))}
            </RevealGroup>
          </div>
        </section>

        <section className="bg-white px-5 py-24 sm:px-6 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <h2 className="mb-12 max-w-3xl text-[44px] font-normal leading-[1.03] tracking-[-0.035em] sm:text-[64px]">
                Пользователи запускаются быстрее
              </h2>
            </Reveal>
            <RevealGroup stagger={120} className="grid gap-4 md:grid-cols-3">
              {TESTIMONIALS.map((item) => (
                <article key={item.name} className="rounded-[18px] border border-black/[0.06] bg-[#f8f8f5] p-7 shadow-[0_18px_60px_rgba(20,25,35,0.04)]">
                  <p className="text-[18px] leading-[1.45] text-black/72">&ldquo;{item.text}&rdquo;</p>
                  <div className="mt-10 border-t border-black/10 pt-5">
                    <p className="font-bold">{item.name}</p>
                    <p className="mt-1 text-[14px] text-black/45">{item.role}</p>
                  </div>
                </article>
              ))}
            </RevealGroup>
          </div>
        </section>

        <section id="faq" className="faq-section bg-white px-5 py-24 sm:px-6 lg:py-32">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.35fr]">
            <Reveal>
              <div className="faq-heading lg:sticky lg:top-24">
                <h2>
                  Частые
                  <br />
                  вопросы
                </h2>
              </div>
            </Reveal>

            <div className="faq-list">
              {FAQ_ITEMS.map((item) => (
                <FaqItem key={item.q} question={item.q} answer={item.a} />
              ))}
            </div>
          </div>
        </section>

        <section className="sendoff-section relative overflow-hidden px-5 py-28 text-white sm:px-6 lg:py-40">
          <div className="sendoff-orbits" aria-hidden="true" />
          <Reveal direction="up">
            <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center text-center">
              <h2 className="max-w-5xl text-[58px] font-normal leading-[0.9] tracking-[-0.065em] sm:text-[104px] lg:text-[132px]">
                Что собираем сегодня?
              </h2>
              <p className="mt-8 max-w-xl text-[18px] leading-[1.45] text-white/58">
                Начните с одной фразы. Agently разложит идею на сайт, дизайн, CRM, маркетинг и первые действия команды.
              </p>
              <Link
                href="/login"
                className="mt-9 inline-flex items-center rounded-full bg-white px-7 py-4 text-[15px] font-bold text-black shadow-[0_24px_80px_rgba(255,255,255,0.12)] transition hover:-translate-y-0.5 hover:bg-[#d9f4ff]"
              >
                Get started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="footer-rich bg-[#f7f7f4] px-5 pb-10 pt-16 sm:px-6 lg:pt-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 border-b border-black/10 pb-12 lg:grid-cols-[1.1fr_1.9fr]">
            <div>
              <div className="mb-6 flex items-center gap-2 text-black">
                <LogoMark />
                <span className="text-[18px] font-extrabold">Agently</span>
              </div>
              <p className="max-w-md text-[16px] leading-[1.5] text-black/58">
                AI-платформа, которая помогает предпринимателям собирать сайты, CRM, дизайн, маркетинг и поддержку через одну команду агентов.
              </p>
              <div className="mt-8 flex gap-3">
                {["X", "DC", "IN", "RD"].map((item) => (
                  <a key={item} href="#" className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white text-[12px] font-bold text-black/58 transition hover:-translate-y-0.5 hover:text-black">
                    {item}
                  </a>
                ))}
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {FOOTER_COLUMNS.map((column) => (
                <div key={column.title}>
                  <h3 className="mb-4 text-[12px] font-extrabold uppercase tracking-[0.14em] text-black/38">
                    {column.title}
                  </h3>
                  <ul className="space-y-3">
                    {column.links.map((link) => (
                      <li key={link}>
                        <a href="#" className="text-[15px] font-medium text-black/62 transition hover:text-black">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4 pt-7 text-[13px] text-black/42 md:flex-row md:items-center">
            <p>© 2026 Agently. Все права защищены.</p>
            <div className="flex gap-5">
              <a href="#" className="hover:text-black">Статус</a>
              <a href="#" className="hover:text-black">Сообщество</a>
              <a href="#" className="hover:text-black">Поддержка</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LimitlessBridge() {
  return (
    <section className="limitless-bridge relative overflow-hidden px-5 pb-0 pt-20 text-center sm:px-6 lg:pt-24">
      <Reveal direction="up" visibleClassName="gradient-title-visible">
        <h2 className="gradient-title mx-auto max-w-6xl text-[52px] font-normal leading-[0.95] tracking-[-0.065em] sm:text-[92px] lg:text-[126px]">
          Возможности без границ
        </h2>
      </Reveal>
    </section>
  );
}

function ProductStoryStack() {
  useStoryStackMotion();

  return (
    <section id="how" className="story-scroll-section relative px-5 sm:px-6" data-story-section>
      <div className="story-top-glow" aria-hidden="true" />
      <div className="story-sticky-stage">
        <div className="story-stack-frame">
          {FEATURE_STORIES.map((story, index) => (
            <article
              key={story.title}
              className={`story-card story-card-${story.tone}`}
              style={{ zIndex: 20 + index }}
              data-story-card
            >
              <div className="story-copy">
                <div className="story-kicker">
                  <span>{story.num}</span>
                  <span className="text-black/34">/</span>
                  <span className="text-black/42">04</span>
                  <h3>{story.title}</h3>
                </div>
                <p>{story.desc}</p>
                <Link href="/login" className="story-button">
                  Начать сборку <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <FeatureVisual type={story.visual} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function useStoryStackMotion() {
  useEffect(() => {
    const section = document.querySelector<HTMLElement>("[data-story-section]");
    const stage = section?.querySelector<HTMLElement>(".story-sticky-stage");
    const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-story-card]"));
    let step = 1;
    let stickyTop = 64;
    let progress = 0;
    let targetProgress = 0;
    let motionFrame = 0;
    let scrollDistance = 1;
    const lastCardIndex = Math.max(cards.length - 1, 0);

    const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
    const clampProgress = (value: number) => Math.min(Math.max(value, 0), scrollDistance);
    const smootherStep = (value: number) => value * value * value * (value * (value * 6 - 15) + 10);

    const syncLayout = () => {
      if (!section || !stage || cards.length === 0) {
        return;
      }

      stickyTop = Number.parseFloat(window.getComputedStyle(stage).top) || 64;
      step = Math.min(Math.max(window.innerHeight * 0.82, 620), 900);
      scrollDistance = Math.max(lastCardIndex * step, 1);

      const stickyHeight = Math.max(window.innerHeight - stickyTop, 1);
      const releaseHold = Math.min(Math.max(window.innerHeight * 0.18, 120), 220);
      section.style.setProperty("--story-scroll-height", `${stickyHeight + scrollDistance + releaseHold}px`);
    };

    const render = (value = progress) => {
      if (cards.length === 0) {
        return;
      }

      const stackProgress = clampProgress(value);
      const travel = step * 0.92;

      cards.forEach((card, index) => {
        const enterRaw = index === 0 ? 1 : clamp((stackProgress - (index - 1) * step) / travel);
        const coverRaw = index === lastCardIndex ? 0 : clamp((stackProgress - index * step) / travel);
        const enter = smootherStep(enterRaw);
        const cover = smootherStep(coverRaw);
        const slide = index === 0 ? 0 : (1 - enter) * 100;
        const shade = cover * 0.07;

        card.style.setProperty("--card-y", `${slide}%`);
        card.style.setProperty("--card-lift", "0px");
        card.style.setProperty("--card-scale", "1");
        card.style.setProperty("--card-shade", shade.toFixed(3));
        card.style.setProperty("--card-opacity", index === 0 || enterRaw > 0.001 ? "1" : "0");
      });
    };

    const tickMotion = () => {
      const distance = targetProgress - progress;

      if (Math.abs(distance) < 0.35) {
        progress = targetProgress;
        render();
        motionFrame = 0;
        return;
      }

      progress += distance * 0.16;
      render();
      motionFrame = window.requestAnimationFrame(tickMotion);
    };

    const startMotion = () => {
      if (!motionFrame) {
        motionFrame = window.requestAnimationFrame(tickMotion);
      }
    };

    const onScroll = () => {
      if (!section) {
        return;
      }

      const rect = section.getBoundingClientRect();
      targetProgress = clampProgress(stickyTop - rect.top);
      startMotion();
    };

    const onResize = () => {
      const oldMaxProgress = Math.max(scrollDistance, 1);
      const progressRatio = clamp(progress / oldMaxProgress);
      const targetRatio = clamp(targetProgress / oldMaxProgress);
      syncLayout();
      progress = progressRatio * scrollDistance;
      targetProgress = targetRatio * scrollDistance;
      render();
    };

    syncLayout();
    onScroll();
    render();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      if (motionFrame) {
        window.cancelAnimationFrame(motionFrame);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);
}

function FeatureVisual({ type }: { type: string }) {
  if (type === "tasks") {
    return (
      <div className="feature-visual feature-visual-dark">
        <div className="visual-topbar">
          <span className="visual-face">A</span>
          <span>Steppe Tasks</span>
          <span className="ml-auto h-7 w-7 rounded-full bg-white/20" />
        </div>
        <div className="px-6 pb-6 pt-5">
          <div className="mb-5 flex items-center justify-between">
            <h4 className="text-[30px] tracking-[-0.04em] text-white">Все задачи</h4>
            <div className="flex gap-3 text-[12px] text-white/50">
              <span>Поиск</span>
              <span>Фильтр</span>
            </div>
          </div>
          <div className="grid min-w-[680px] grid-cols-4 gap-3">
            {["Product", "Marketing", "Design", "Content"].map((column, i) => (
              <div key={column}>
                <div className={`mb-2 rounded-t-[6px] px-3 py-2 text-[12px] font-bold ${i === 0 ? "bg-[#eef45f]" : i === 1 ? "bg-[#d8c8ff]" : i === 2 ? "bg-[#ef8064]" : "bg-[#9ee8bf]"}`}>
                  {column} {i + 3}
                </div>
                {[0, 1, 2, 3, 4].map((item) => (
                  <div key={item} className="mb-2 rounded-[4px] bg-white/[0.09] p-3 text-[11px] text-white/62">
                    <div className="mb-2 h-2 w-20 rounded-full bg-white/18" />
                    <span className={`rounded-full px-2 py-0.5 text-[9px] ${item % 3 === 0 ? "bg-[#8ee4a7] text-black" : item % 3 === 1 ? "bg-[#c8a7ff]" : "bg-[#ef8064]"}`}>
                      {item % 3 === 0 ? "Done" : item % 3 === 1 ? "In progress" : "Review"}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="visual-prompt">
          <span>Создай task management app</span>
          <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-black text-white">
            <ArrowRight className="h-5 w-5" />
          </span>
        </div>
      </div>
    );
  }

  if (type === "backend") {
    return (
      <div className="feature-visual feature-visual-warm">
        <div className="builder-shell">
          <aside>
            {["Auth", "DB", "Roles", "API"].map((item, index) => (
              <span key={item} className={index === 0 ? "is-active" : ""}>{item}</span>
            ))}
          </aside>
          <main>
            <div className="builder-toolbar">
              <span />
              <span />
              <span />
            </div>
            <h4>Бэкенд проекта</h4>
            {["Профили клиентов", "Каталог услуг", "Сделки CRM", "Уведомления"].map((item, index) => (
              <div key={item} className="schema-row">
                <span>{item}</span>
                <b>{index === 0 ? "auth" : index === 1 ? "data" : index === 2 ? "flow" : "api"}</b>
              </div>
            ))}
          </main>
        </div>
      </div>
    );
  }

  if (type === "launch") {
    return (
      <div className="feature-visual feature-visual-yellow">
        <div className="browser-card">
          <div className="browser-bar">
            <span className="grid h-8 w-8 place-items-center rounded-full border border-black/10">⌂</span>
            <span className="rounded-full bg-[#f5f4ef] px-6 py-3 text-[24px] tracking-[-0.04em]">studio.agently.app</span>
          </div>
          <div className="browser-page">
            <aside />
            <main>
              <h4>Запуск готов</h4>
              <p>Заявки, домен, аналитика и первые страницы уже собраны.</p>
              <div className="course-grid">
                <span />
                <span />
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feature-visual feature-visual-violet">
      <div className="model-card">
        <div className="model-option is-selected">
          <div>
            <h4>Automatic</h4>
            <p>Подбирает лучшего агента и модель для каждого запроса</p>
          </div>
          <span>✓</span>
        </div>
        <div className="model-option">
          <div>
            <h4>Manual</h4>
            <p>Выберите конкретного агента под задачу</p>
          </div>
          <span>⌄</span>
        </div>
      </div>
    </div>
  );
}

function useHeroScrollGradient() {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;

    const update = () => {
      const progress = Math.min(window.scrollY / (window.innerHeight * 1.15), 1);
      root.style.setProperty("--hero-scroll", progress.toFixed(3));
      frame = 0;
    };

    const onScroll = () => {
      if (frame) {
        return;
      }
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
}

function PromptComposer() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "holding" | "deleting">("typing");
  const prompt = PROMPTS[promptIndex];

  useEffect(() => {
    const delay = phase === "holding" ? 1450 : phase === "typing" ? 38 : 18;

    const timeout = window.setTimeout(() => {
      if (phase === "typing") {
        if (text.length < prompt.length) {
          setText(prompt.slice(0, text.length + 1));
        } else {
          setPhase("holding");
        }
        return;
      }

      if (phase === "holding") {
        setPhase("deleting");
        return;
      }

      if (text.length > 0) {
        setText(prompt.slice(0, text.length - 1));
      } else {
        setPromptIndex((current) => (current + 1) % PROMPTS.length);
        setPhase("typing");
      }
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [phase, prompt, text]);

  return (
    <div className="prompt-card relative rounded-[22px] border border-white/75 bg-white/74 p-5 text-left shadow-[0_24px_80px_rgba(35,38,44,0.10)] backdrop-blur-2xl">
      <div className="min-h-[72px] px-2 pt-1 text-[21px] leading-[1.3] tracking-[-0.02em] text-[#60636d] sm:text-[25px]">
        <span>{text}</span>
        <span className="typing-caret" aria-hidden="true" />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-black/[0.06] px-1 pt-4">
        <div className="flex items-center gap-3">
          <button aria-label="Добавить файл" className="grid h-8 w-8 place-items-center rounded-full text-black transition hover:bg-black/5">
            <PlusIcon />
          </button>
          <button aria-label="Режим плана" className="inline-flex items-center gap-2 rounded-full text-[13px] font-semibold text-black/70">
            <span className="h-5 w-9 rounded-full bg-black/[0.06] p-0.5">
              <span className="block h-4 w-4 rounded-full bg-white shadow-sm" />
            </span>
            План
            <InfoIcon />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button aria-label="Голосовой ввод" className="grid h-8 w-8 place-items-center rounded-full text-black/60 transition hover:bg-black/5">
            <MicIcon />
          </button>
          <Link
            href="/login"
            aria-label="Отправить запрос"
            className="grid h-9 w-9 place-items-center rounded-full bg-black text-white transition hover:scale-105 hover:bg-[#6c5cff]"
          >
            <ArrowUpIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="faq-item">
      <button
        onClick={() => setOpen(!open)}
        className="faq-trigger"
      >
        <span>{question}</span>
        <span className={`faq-plus ${open ? "is-open" : ""}`}>
          <PlusIcon />
        </span>
      </button>
      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <p className="faq-answer">{answer}</p>
        </div>
      </div>
    </article>
  );
}

function LogoMark() {
  return (
    <span className="flex h-7 w-7 items-center justify-center gap-[2px] rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <span className="h-4 w-[3px] rounded-full bg-[#fff06f]" />
      <span className="h-5 w-[3px] rounded-full bg-[#ffb6cf]" />
      <span className="h-4 w-[3px] rounded-full bg-[#9d8cff]" />
      <span className="h-5 w-[3px] rounded-full bg-[#77ddff]" />
    </span>
  );
}

function ChevronDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="6.4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.5 8.5H14.5M8.5 2.1C10.1 3.8 10.8 5.9 10.8 8.5C10.8 11.1 10.1 13.2 8.5 14.9C6.9 13.2 6.2 11.1 6.2 8.5C6.2 5.9 6.9 3.8 8.5 2.1Z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRight({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 12.5V3.5M4.5 7L8 3.5L11.5 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3.5V12.5M3.5 8H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M7.5 9.2C6.35 9.2 5.45 8.3 5.45 7.15V3.9C5.45 2.75 6.35 1.85 7.5 1.85C8.65 1.85 9.55 2.75 9.55 3.9V7.15C9.55 8.3 8.65 9.2 7.5 9.2Z" stroke="currentColor" strokeWidth="1.35" />
      <path d="M3.7 6.8C3.7 8.9 5.35 10.65 7.5 10.65M11.3 6.8C11.3 8.9 9.65 10.65 7.5 10.65M7.5 10.65V13.15" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="4.4" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
      <path d="M6.5 6.1V8.65M6.5 4.45H6.51" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
