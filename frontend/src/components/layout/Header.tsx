"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";

function formatNumber(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const BREADCRUMB_MAP: Record<string, string> = {
  projects: "Проекты",
  "new-project": "Новый проект",
  agents: "Агенты",
  catalog: "Каталог",
  settings: "Настройки",
  usage: "Использование",
  web_developer: "Веб-разработчик",
  designer: "Дизайнер",
  crm_manager: "CRM-менеджер",
  support: "Поддержка",
  marketer: "Маркетолог",
  seo: "SEO",
  analyst: "Аналитик",
};

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [showDetails, setShowDetails] = useState(false);

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let accumulated = "";

  for (const seg of segments) {
    accumulated += `/${seg}`;
    const label = BREADCRUMB_MAP[seg] ?? seg;
    crumbs.push({ label, href: accumulated });
  }

  const tokensUsed = user?.tokens_used_today ?? 0;
  const tokensLimit = user?.tokens_limit ?? 10000;
  const imagesUsed = user?.images_used_today ?? 0;
  const imagesLimit = user?.images_limit ?? 3;
  const plan = user?.plan ?? "free";
  const pct = tokensLimit > 0 ? Math.min((tokensUsed / tokensLimit) * 100, 100) : 0;

  const barColor =
    pct < 50 ? "bg-green-500" : pct < 80 ? "bg-yellow-500" : "bg-red-500";

  return (
    <header className="flex items-center justify-between border-b border-border bg-white pl-14 pr-6 py-3 lg:pl-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm">
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-foreground/30">/</span>}
            {i === crumbs.length - 1 ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-foreground/50 hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Token usage */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 rounded-btn border border-border px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm text-foreground/70">Лимит на сегодня</span>
            <svg
              className={`h-4 w-4 text-foreground/40 transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Details dropdown */}
          {showDetails && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-card border border-border bg-white p-4 shadow-modal z-50 animate-scale-in">
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Использование сегодня
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground/60">Токены</span>
                    <span className="text-foreground">
                      {formatNumber(tokensUsed)} / {formatNumber(tokensLimit)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground/60">Изображения</span>
                    <span className="text-foreground">
                      {imagesUsed} / {imagesLimit}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{
                        width: `${imagesLimit > 0 ? Math.min((imagesUsed / imagesLimit) * 100, 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-xs text-foreground/40">
                    Тариф: <span className="font-medium text-foreground">{plan}</span>
                  </span>
                  <Link
                    href="/settings/usage"
                    className="text-xs text-accent hover:underline"
                    onClick={() => setShowDetails(false)}
                  >
                    Подробнее
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notification bell placeholder */}
        <button className="text-foreground/30 hover:text-foreground transition-colors">
          🔔
        </button>
      </div>
    </header>
  );
}
