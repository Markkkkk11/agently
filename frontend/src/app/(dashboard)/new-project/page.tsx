"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import Button from "@/components/ui/Button";
import type { ProjectCreateResult } from "@/types/project";

const EXAMPLE_IDEAS = [
  "Интернет-магазин обуви",
  "Кофейня с доставкой",
  "Онлайн-школа английского",
  "Студия веб-дизайна",
  "Салон красоты",
];

export default function NewProjectPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, fetchMe } = useAuthStore();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setError("");
    setLoading(true);

    const { data, error: apiError } = await api.post<ProjectCreateResult>(
      "/projects",
      { description }
    );

    setLoading(false);

    if (apiError) {
      setError(apiError.message);
      return;
    }

    if (data) {
      router.push(`/projects/${data.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-foreground/50">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl text-center">
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          Опишите вашу бизнес-идею
        </h1>
        <p className="mb-8 text-foreground/60">
          AI-координатор проанализирует идею и подберёт команду агентов
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Например: Хочу открыть интернет-магазин обуви в Москве с доставкой по России..."
            rows={4}
            className="w-full resize-none rounded-card border border-border bg-white px-5 py-4 text-foreground outline-none transition-all duration-150 focus:border-accent focus:ring-1 focus:ring-accent"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            disabled={loading || !description.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? "Анализируем идею..." : "Создать проект"}
          </Button>
        </form>

        <div className="mt-8">
          <p className="mb-3 text-sm text-foreground/40">Попробуйте:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLE_IDEAS.map((idea) => (
              <button
                key={idea}
                onClick={() => setDescription(idea)}
                className="rounded-full border border-border bg-white px-4 py-1.5 text-sm text-foreground/70 hover:border-accent hover:text-accent transition-all duration-150"
              >
                {idea}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
