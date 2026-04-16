"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Skeleton from "@/components/ui/Skeleton";

interface AgentTemplate {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  capabilities: string[];
}

export default function CatalogPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, fetchMe } = useAuthStore();
  const [catalog, setCatalog] = useState<AgentTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!isLoading && isAuthenticated) {
      loadCatalog();
    }
  }, [isLoading, isAuthenticated, router]);

  const loadCatalog = async () => {
    const { data } = await api.get<AgentTemplate[]>("/agents/catalog");
    if (data) setCatalog(data);
    setLoading(false);
  };

  if (isLoading || loading) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-4xl">
          <Skeleton className="mb-2 h-8 w-56" />
          <Skeleton className="mb-8 h-5 w-96" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Каталог AI-агентов
        </h1>
        <p className="mb-8 text-foreground/50">
          Доступные агенты для подключения к вашим проектам
        </p>

        {catalog.length === 0 ? (
          <Card className="py-12 text-center">
            <p className="text-foreground/50">
              Каталог пуст. Запустите миграции и seed для заполнения.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.map((agent) => (
              <Card key={agent.type} hover className="flex flex-col">
                <div className="mb-3 flex items-center gap-3">
                  <Avatar icon={agent.icon} name={agent.name} />
                  <p className="font-semibold text-foreground">{agent.name}</p>
                </div>
                <p className="mb-3 flex-1 text-sm text-foreground/60 line-clamp-2">
                  {agent.description}
                </p>
                {agent.capabilities && agent.capabilities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {agent.capabilities.slice(0, 3).map((cap) => (
                      <span
                        key={cap}
                        className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-foreground/60"
                      >
                        {cap}
                      </span>
                    ))}
                    {agent.capabilities.length > 3 && (
                      <span className="text-xs text-foreground/40">
                        +{agent.capabilities.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
