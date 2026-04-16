"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import type { Project, AgentTemplate } from "@/types/project";

function useIsDesktop() {
  const [d, setD] = useState(false);
  useEffect(() => { const c = () => setD(window.innerWidth >= 1024); c(); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  return d;
}

const AGENT_COLORS = [
  { bg: "bg-red-50", pin: "pin-red", border: "border-red-100" },
  { bg: "bg-blue-50", pin: "pin-blue", border: "border-blue-100" },
  { bg: "bg-green-50", pin: "pin-green", border: "border-green-100" },
  { bg: "bg-yellow-50", pin: "pin-yellow", border: "border-yellow-100" },
  { bg: "bg-purple-50", pin: "pin-purple", border: "border-purple-100" },
  { bg: "bg-pink-50", pin: "pin-pink", border: "border-pink-100" },
  { bg: "bg-orange-50", pin: "pin-orange", border: "border-orange-100" },
];

const AGENT_AVATARS: Record<string, string> = {
  web_developer: "\uD83D\uDC68\u200D\uD83D\uDCBB",
  designer: "\uD83D\uDC69\u200D\uD83C\uDFA8",
  crm_manager: "\uD83D\uDC68\u200D\uD83D\uDCBC",
  support: "\uD83D\uDC69\u200D\uD83D\uDD27",
  marketer: "\uD83D\uDC69\u200D\uD83D\uDCBB",
  seo: "\uD83D\uDD75\uFE0F",
  analyst: "\uD83D\uDC68\u200D\uD83D\uDD2C",
};

const AGENT_LABELS: Record<string, string> = {
  web_developer: "AI-\u0440\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u0447\u0438\u043a",
  designer: "AI-\u0434\u0438\u0437\u0430\u0439\u043d\u0435\u0440",
  crm_manager: "CRM-\u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440",
  support: "AI-\u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430",
  marketer: "AI-\u043c\u0430\u0440\u043a\u0435\u0442\u043e\u043b\u043e\u0433",
  seo: "SEO-\u0441\u043f\u0435\u0446\u0438\u0430\u043b\u0438\u0441\u0442",
  analyst: "AI-\u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading, fetchMe } = useAuthStore();

  const [project, setProject] = useState<Project | null>(null);
  const [catalog, setCatalog] = useState<AgentTemplate[]>([]);
  const [showCatalog, setShowCatalog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [mobileView, setMobileView] = useState<"project" | "preview">("project");
  const [splitPercent, setSplitPercent] = useState(55);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const isDesktop = useIsDesktop();

  const projectId = params.id as string;

  const loadProject = useCallback(async () => {
    const { data } = await api.get<Project>(`/projects/${projectId}`);
    if (data) {
      setProject(data);
      setName(data.name);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!isLoading && isAuthenticated) {
      loadProject();
    }
  }, [isLoading, isAuthenticated, router, loadProject]);

  useEffect(() => {
    if (project && project.agents.length > 0) {
      const allDone = project.agents.every((a) => a.task_completed);
      if (allDone) setShowCongrats(true);
    }
  }, [project]);

  const loadCatalog = async () => {
    const { data } = await api.get<AgentTemplate[]>("/agents/catalog");
    if (data) setCatalog(data);
    setShowCatalog(true);
  };

  const addAgent = async (agentType: string) => {
    await api.post(`/projects/${projectId}/agents`, { agent_type: agentType });
    setShowCatalog(false);
    loadProject();
  };

  const removeAgent = async (agentType: string) => {
    await api.delete(`/projects/${projectId}/agents/${agentType}`);
    loadProject();
  };

  const saveName = async () => {
    if (name.trim() && name !== project?.name) {
      await api.patch(`/projects/${projectId}`, { name });
      loadProject();
    }
    setEditingName(false);
  };

  const [iframeKey, setIframeKey] = useState(0);

  const startDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    setIsDragging(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.min(Math.max(pct, 35), 70));
    };
    const onUp = () => {
      dragging.current = false;
      setIsDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  const deleteProject = async () => {
    await api.delete(`/projects/${projectId}`);
    router.push("/projects");
  };

  if (isLoading || loading) {
    return (
      <div className="p-8 bg-gradient-soft min-h-full">
        <div className="mx-auto max-w-5xl">
          <Skeleton className="mb-4 h-5 w-24" />
          <Skeleton className="mb-6 h-9 w-64" />
          <Skeleton className="h-64 w-full rounded-card" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gradient-soft">
        <p className="text-foreground/50">Проект не найден</p>
      </div>
    );
  }

  const connectedTypes = new Set(project.agents.map((a) => a.agent_type));
  const totalAgents = project.agents.length;
  const completedAgents = project.agents.filter((a) => a.task_completed).length;
  const progressPercent = totalAgents > 0 ? Math.round((completedAgents / totalAgents) * 100) : 0;

  const accessToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : "";
  const siteUrl = `/api/v1/projects/${projectId}/site?token=${accessToken ?? ""}`;

  const showProject = isDesktop || mobileView === "project";
  const showPreview = isDesktop || mobileView === "preview";

  return (
    <div className="flex h-full flex-col">
      {/* Top bar with mobile toggle */}
      <div className="flex items-center justify-between border-b border-border bg-white px-4 lg:px-6 py-2.5 flex-shrink-0 lg:hidden">
        <button onClick={() => router.push("/projects")} className="flex items-center gap-1 text-sm text-foreground/40 hover:text-foreground transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 12L6 8L10 4" /></svg>
          Проекты
        </button>
        <button
          onClick={() => setMobileView(mobileView === "project" ? "preview" : "project")}
          className="flex h-9 items-center gap-1.5 rounded-btn bg-accent text-white px-4 text-sm font-medium hover:bg-accent-hover transition-all shadow-sm"
        >
          {mobileView === "project" ? (
            <><span>Сайт</span><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3L9 7L5 11" /></svg></>
          ) : (
            <><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11L5 7L9 3" /></svg><span>Проект</span></>
          )}
        </button>
      </div>

      {/* Split content */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* Left: Project content */}
        {showProject && (
          <div className="overflow-y-auto bg-gradient-soft" style={{ width: isDesktop ? `${splitPercent}%` : "100%" }}>
            <div className="p-6 lg:p-8">
              {/* Back — desktop only */}
              <button onClick={() => router.push("/projects")} className="hidden lg:flex mb-4 items-center gap-1.5 text-sm text-foreground/40 hover:text-foreground transition-colors">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 12L6 8L10 4" /></svg>
                Все проекты
              </button>

              {/* Project header */}
              <div className="mb-4 flex items-center gap-3 flex-wrap">
                {editingName ? (
                  <input value={name} onChange={(e) => setName(e.target.value)} onBlur={saveName} onKeyDown={(e) => e.key === "Enter" && saveName()} autoFocus className="text-xl font-bold text-foreground border-b-2 border-accent outline-none bg-transparent" />
                ) : (
                  <h1 className="text-xl font-bold text-foreground cursor-pointer hover:text-accent transition-colors" onClick={() => setEditingName(true)}>{project.name}</h1>
                )}
                <Badge variant={project.status === "active" ? "active" : "paused"}>
                  {project.status === "active" ? "Активен" : "Неактивен"}
                </Badge>
              </div>

              {project.description && <p className="mb-6 text-foreground/50 text-sm">{project.description}</p>}

              {/* Progress bar */}
              {totalAgents > 0 && (
                <div className="mb-6 rounded-card bg-white/80 border border-white/50 p-4 shadow-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                      <span className="text-sm font-semibold text-foreground">Ход работы</span>
                    </div>
                    <span className="text-base font-bold text-accent">{progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${progressPercent}%`, background: progressPercent === 100 ? "linear-gradient(90deg, #10b981, #34d399)" : "linear-gradient(90deg, #6366f1, #818cf8, #a78bfa)" }} />
                  </div>
                  <p className="mt-1.5 text-xs text-foreground/40">{completedAgents} из {totalAgents} завершили</p>
                </div>
              )}

              {/* Agents */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">Команда агентов</h2>
                <Button variant="secondary" size="sm" onClick={loadCatalog}>+ Добавить</Button>
              </div>

              {project.agents.length === 0 ? (
                <div className="rounded-card border-2 border-dashed border-gray-200 bg-white/50 py-12 text-center">
                  <p className="text-foreground/50 mb-3 text-sm">Агенты пока не добавлены</p>
                  <Button variant="primary" size="sm" onClick={loadCatalog}>Добавить из каталога</Button>
                </div>
              ) : (
                <div className="relative rounded-card bg-white/40 border border-white/60 p-5 shadow-card">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#9ca3af" strokeWidth="0.5" strokeDasharray="4 4" /></pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                  <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {project.agents.map((agent, i) => {
                      const color = AGENT_COLORS[i % AGENT_COLORS.length];
                      const num = String(i + 1).padStart(2, "0");
                      return (
                        <div key={agent.agent_type} className={`group relative rounded-card ${color.bg} ${color.border} border p-4 cursor-pointer hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200`} onClick={() => router.push(`/projects/${projectId}/agents/${agent.agent_type}`)}>
                          <div className={`absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full ${color.pin} shadow-sm`} />
                          <button onClick={(e) => { e.stopPropagation(); removeAgent(agent.agent_type); }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 rounded-full bg-white/80 text-foreground/40 text-xs flex items-center justify-center hover:text-red-500">
                            <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="1" y1="1" x2="9" y2="9" /><line x1="9" y1="1" x2="1" y2="9" /></svg>
                          </button>
                          <span className="text-xs font-bold text-accent mb-2 block">{num}</span>
                          <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-xl ${agent.task_completed ? "ring-2 ring-green-400" : ""}`}>
                            {AGENT_AVATARS[agent.agent_type] ?? "\uD83E\uDDD1\u200D\uD83D\uDCBC"}
                          </div>
                          <p className="text-xs font-semibold text-foreground leading-tight mb-0.5">{agent.name}</p>
                          <p className={`text-[10px] font-medium ${agent.task_completed ? "text-green-600" : "text-foreground/40"}`}>{agent.task_completed ? "\u2713 Завершено" : "В работе"}</p>
                        </div>
                      );
                    })}
                    <div className="group rounded-card border-2 border-dashed border-gray-200 bg-white/30 p-4 flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-accent-light/30 transition-all duration-200" onClick={loadCatalog}>
                      <div className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm group-hover:shadow-glow transition-shadow">
                        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"><line x1="9" y1="1" x2="9" y2="17" /><line x1="1" y1="9" x2="17" y2="9" /></svg>
                      </div>
                      <p className="text-xs text-foreground/40 group-hover:text-accent transition-colors font-medium">Добавить</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete */}
              <div className="mt-10 border-t border-border/50 pt-4">
                {!confirmDelete ? (
                  <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)} className="text-foreground/30 hover:text-red-500">Удалить проект</Button>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground/50">Удалить?</span>
                    <Button variant="danger" size="sm" onClick={deleteProject}>Да</Button>
                    <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(false)}>Нет</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Resizable divider — desktop only */}
        {isDesktop && (
          <div onMouseDown={startDrag} className="flex w-1.5 cursor-col-resize items-center justify-center bg-border/30 hover:bg-accent/20 active:bg-accent/30 transition-colors group flex-shrink-0">
            <div className="h-8 w-1 rounded-full bg-foreground/15 group-hover:bg-accent/40 transition-colors" />
          </div>
        )}

        {/* Right: Site preview */}
        {showPreview && (
          <div className="flex flex-col overflow-hidden" style={{ width: isDesktop ? `${100 - splitPercent}%` : "100%" }}>
            <div className="border-b border-border bg-white px-4 py-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 rounded-md bg-gray-100 px-3 py-1 text-xs text-foreground/30 text-center truncate">{project.name} — предпросмотр</div>
                <button onClick={() => setIframeKey((k) => k + 1)} className="text-foreground/30 hover:text-foreground transition-colors" title="Обновить">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1v4h4" /><path d="M13 13v-4h-4" /><path d="M11.5 5A5.5 5.5 0 0 0 2 3.5L1 5" /><path d="M2.5 9A5.5 5.5 0 0 0 12 10.5L13 9" /></svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-white">
              <iframe key={iframeKey} src={siteUrl} className={`h-full w-full border-0 ${isDragging ? "pointer-events-none" : ""}`} title="Site preview" sandbox="allow-scripts allow-same-origin" />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal open={showCatalog} onClose={() => setShowCatalog(false)} title="Каталог агентов">
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {catalog.map((tmpl, i) => {
            const connected = connectedTypes.has(tmpl.type);
            const color = AGENT_COLORS[i % AGENT_COLORS.length];
            return (
              <div key={tmpl.type} className={`flex items-center justify-between rounded-btn border ${color.border} ${color.bg} p-3.5`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm text-xl">{AGENT_AVATARS[tmpl.type] ?? "\uD83E\uDDD1\u200D\uD83D\uDCBC"}</div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{tmpl.name}</p>
                    <p className="text-xs text-foreground/40 line-clamp-1">{tmpl.description}</p>
                  </div>
                </div>
                {connected ? <Badge variant="active">Добавлен</Badge> : <Button size="sm" onClick={() => addAgent(tmpl.type)}>Добавить</Button>}
              </div>
            );
          })}
        </div>
      </Modal>

      <Modal open={showCongrats} onClose={() => setShowCongrats(false)} title="">
        <div className="text-center py-8">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Поздравляем!</h2>
          <p className="text-foreground/50 mb-8">Ваш стартап &laquo;{project.name}&raquo; готов к запуску!</p>
          <Button onClick={() => setShowCongrats(false)} size="lg">Отлично!</Button>
        </div>
      </Modal>
    </div>
  );
}
