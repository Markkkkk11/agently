"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import Card from "@/components/ui/Card";

export default function ApiKeysPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, fetchMe } = useAuthStore();

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
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => router.push("/settings")}
          className="mb-4 text-sm text-foreground/50 hover:text-foreground transition-colors"
        >
          ← Настройки
        </button>

        <h1 className="mb-2 text-2xl font-bold text-foreground">API-ключи</h1>
        <p className="mb-8 text-foreground/50">
          Подключение собственных ключей для AI-провайдеров
        </p>

        <Card className="py-12 text-center">
          <p className="text-4xl mb-4">🔑</p>
          <p className="text-foreground/50 mb-2">
            Управление API-ключами будет доступно в следующей версии
          </p>
          <p className="text-sm text-foreground/40">
            Вы сможете подключить свои ключи OpenAI, Anthropic и других
            провайдеров
          </p>
        </Card>
      </div>
    </div>
  );
}
