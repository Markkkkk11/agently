"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";
import Card from "@/components/ui/Card";

const SETTINGS_ITEMS = [
  {
    href: "/settings/usage",
    icon: "📊",
    title: "Использование",
    description: "Статистика токенов, лимиты тарифа и история",
  },
  {
    href: "/settings/profile",
    icon: "👤",
    title: "Профиль",
    description: "Имя, email и данные аккаунта",
  },
  {
    href: "/settings/billing",
    icon: "💳",
    title: "Тариф и оплата",
    description: "Управление подпиской и способами оплаты",
  },
  {
    href: "/settings/api",
    icon: "🔑",
    title: "API-ключи",
    description: "Подключение собственных ключей OpenAI, Anthropic и др.",
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, fetchMe, user } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Настройки</h1>
        <p className="mb-8 text-foreground/50">
          Управление аккаунтом и конфигурацией
        </p>

        {user && (
          <Card className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-xl">
              👤
            </div>
            <div>
              <p className="font-medium text-foreground">{user.email}</p>
              <p className="text-sm text-foreground/50">
                Тариф:{" "}
                <span className="font-medium text-accent">{user.plan}</span>
              </p>
            </div>
          </Card>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {SETTINGS_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card hover className="h-full">
                <div className="mb-2 text-2xl">{item.icon}</div>
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-sm text-foreground/50">
                  {item.description}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
