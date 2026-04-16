"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, fetchMe } = useAuthStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await api.patch("/me", { name: name || null, phone: phone || null });
    await fetchMe();

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (isLoading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-foreground/50">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => router.push("/settings")}
          className="mb-4 text-sm text-foreground/50 hover:text-foreground transition-colors"
        >
          ← Настройки
        </button>

        <h1 className="mb-2 text-2xl font-bold text-foreground">Профиль</h1>
        <p className="mb-8 text-foreground/50">Управление данными аккаунта</p>

        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email ?? ""}
                  disabled
                  className="w-full rounded-btn border border-border bg-gray-50 px-4 py-2.5 text-sm text-foreground/50"
                />
                <p className="mt-1 text-xs text-foreground/40">
                  Email нельзя изменить
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Имя
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ваше имя"
                  className="w-full rounded-btn border border-border bg-white px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Телефон
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                  className="w-full rounded-btn border border-border bg-white px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>
            </div>
          </Card>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
            {saved && (
              <span className="text-sm text-green-600">Сохранено</span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
