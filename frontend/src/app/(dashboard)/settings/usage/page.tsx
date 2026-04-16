"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

interface UsageDay {
  date: string;
  tokens_used: number;
  images_generated: number;
  requests_count: number;
}

interface UsageData {
  date: string;
  plan: string;
  tokens_used: number;
  tokens_limit: number;
  images_used: number;
  images_limit: number;
  requests_count: number;
}

const PLAN_NAMES: Record<string, string> = {
  free: "Free",
  basic: "Basic",
  pro: "Pro",
  ultra: "Ultra",
};

export default function UsagePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, fetchMe } = useAuthStore();

  const [usage, setUsage] = useState<UsageData | null>(null);
  const [history, setHistory] = useState<UsageDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!authLoading && isAuthenticated) {
      loadData();
    }
  }, [authLoading, isAuthenticated, router]);

  const loadData = async () => {
    const [usageRes, histRes] = await Promise.all([
      api.get<UsageData>("/usage"),
      api.get<UsageDay[]>("/usage/history?days=7"),
    ]);
    if (usageRes.data) setUsage(usageRes.data);
    if (histRes.data) setHistory(histRes.data);
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-3xl space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 rounded-card" />
          <Skeleton className="h-60 rounded-card" />
        </div>
      </div>
    );
  }

  if (!usage) return null;

  const tokenPct = usage.tokens_limit > 0
    ? Math.min((usage.tokens_used / usage.tokens_limit) * 100, 100)
    : 0;
  const imagePct = usage.images_limit > 0
    ? Math.min((usage.images_used / usage.images_limit) * 100, 100)
    : 0;

  const barColor = (pct: number) =>
    pct < 50 ? "bg-green-500" : pct < 80 ? "bg-yellow-500" : "bg-red-500";

  const maxTokens = Math.max(...history.map((d) => d.tokens_used), 1);

  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold text-foreground">
          Использование
        </h1>

        {/* Current plan */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-foreground/50">Текущий тариф</p>
              <p className="text-xl font-bold text-foreground">
                {PLAN_NAMES[usage.plan] ?? usage.plan}
              </p>
            </div>
            {(usage.plan === "free" || usage.plan === "basic") && (
              <Button size="sm">Улучшить тариф</Button>
            )}
          </div>

          {/* Tokens */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-foreground/60">Токены сегодня</span>
              <span className="font-medium text-foreground">
                {usage.tokens_used.toLocaleString()} /{" "}
                {usage.tokens_limit.toLocaleString()}
              </span>
            </div>
            <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${barColor(tokenPct)}`}
                style={{ width: `${tokenPct}%` }}
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-foreground/60">Изображения сегодня</span>
              <span className="font-medium text-foreground">
                {usage.images_used} / {usage.images_limit}
              </span>
            </div>
            <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${barColor(imagePct)}`}
                style={{ width: `${imagePct}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Usage chart (last 7 days) */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Последние 7 дней
          </h2>
          <div className="flex items-end gap-2 h-40">
            {history.map((day) => {
              const h = maxTokens > 0 ? (day.tokens_used / maxTokens) * 100 : 0;
              const dayLabel = new Date(day.date).toLocaleDateString("ru-RU", {
                weekday: "short",
              });
              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-xs text-foreground/40">
                    {day.tokens_used > 0
                      ? day.tokens_used.toLocaleString()
                      : ""}
                  </span>
                  <div className="w-full flex items-end justify-center" style={{ height: "120px" }}>
                    <div
                      className="w-full max-w-[40px] rounded-t bg-accent/80 transition-all duration-300"
                      style={{ height: `${Math.max(h, 2)}%` }}
                    />
                  </div>
                  <span className="text-xs text-foreground/50">{dayLabel}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
