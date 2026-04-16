"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Skeleton from "@/components/ui/Skeleton";
import type { Project } from "@/types/project";

export default function ProjectsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, fetchMe } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [maxProjects, setMaxProjects] = useState<number>(5);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!isLoading && isAuthenticated) {
      loadProjects();
    }
  }, [isLoading, isAuthenticated, router]);

  const loadProjects = async () => {
    const { data } = await api.get<Project[]>("/projects");
    if (data) {
      setProjects(data);
    }
    const { data: usage } = await api.get<{ max_projects: number }>("/usage");
    if (usage) {
      setMaxProjects(usage.max_projects);
    }
    setLoadingProjects(false);
  };

  if (isLoading || loadingProjects) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-36" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Мои проекты</h1>
            <p className="text-sm text-foreground/40">
              {projects.length} / {maxProjects} проектов
            </p>
          </div>
          <Link href="/new-project">
            <Button>Создать проект</Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card className="py-16 text-center">
            <p className="mb-2 text-lg text-foreground/50">
              У вас пока нет проектов
            </p>
            <p className="mb-6 text-sm text-foreground/40">
              Опишите бизнес-идею и AI подберёт команду агентов
            </p>
            <Link href="/new-project">
              <Button>Создать первый проект</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                hover
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <h2 className="mb-1 font-semibold text-foreground">
                  {project.name}
                </h2>
                <p className="mb-3 text-sm text-foreground/50 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex items-center justify-between">
                  <Badge
                    variant={project.status === "active" ? "active" : "paused"}
                  >
                    {project.status === "active" ? "Активен" : "Неактивен"}
                  </Badge>
                  <span className="text-xs text-foreground/40">
                    {project.agents_count} агентов
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
