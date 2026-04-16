"use client";

import { useState } from "react";

interface ImageInfo {
  filename: string;
  path: string;
  size: number;
}

interface AgentPreviewProps {
  agentType: string;
  projectId: string;
  projectName: string;
  siteUrl: string;
  iframeKey: number;
  onRefresh: () => void;
  isDragging?: boolean;
  images: ImageInfo[];
}

export default function AgentPreview({
  agentType,
  projectName,
  siteUrl,
  iframeKey,
  onRefresh,
  isDragging,
  images,
}: AgentPreviewProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : "";

  // Site preview for web_developer
  if (agentType === "web_developer") {
    return (
      <>
        <PreviewBar title={`${projectName} — предпросмотр`} onRefresh={onRefresh} />
        <div className="flex-1 overflow-auto bg-white">
          <iframe
            key={iframeKey}
            src={`${siteUrl}&t=${iframeKey}`}
            className={`h-full w-full border-0 ${isDragging ? "pointer-events-none" : ""}`}
            title="Site preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </>
    );
  }

  // Image gallery for designer
  if (agentType === "designer") {
    return (
      <>
        <PreviewBar title="Галерея изображений" onRefresh={onRefresh} />
        <div className="flex-1 overflow-auto bg-gray-50 p-4">
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-foreground/30">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p className="text-sm text-center">Изображения появятся здесь<br />после генерации дизайнером</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {images.map((img) => (
                <div
                  key={img.filename}
                  className="group relative rounded-card overflow-hidden bg-white border border-border shadow-card cursor-pointer hover:shadow-card-hover transition-shadow"
                  onClick={() => setLightbox(`${img.path}?token=${token}`)}
                >
                  <img
                    src={`${img.path}?token=${token}`}
                    alt={img.filename}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <svg className="opacity-0 group-hover:opacity-100 transition-opacity text-white drop-shadow-lg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="11" y1="8" x2="11" y2="14" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-foreground/50 truncate">{img.filename}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lightbox */}
        {lightbox && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
              onClick={() => setLightbox(null)}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <img
              src={lightbox}
              alt="Preview"
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </>
    );
  }

  // Default: show site preview for all other agents
  return (
    <>
      <PreviewBar title={`${projectName} — предпросмотр`} onRefresh={onRefresh} />
      <div className="flex-1 overflow-auto bg-white">
        <iframe
          key={iframeKey}
          src={`${siteUrl}&t=${iframeKey}`}
          className={`h-full w-full border-0 ${isDragging ? "pointer-events-none" : ""}`}
          title="Site preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </>
  );
}

function PreviewBar({ title, onRefresh }: { title: string; onRefresh: () => void }) {
  return (
    <div className="border-b border-border bg-white px-4 py-2 flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 rounded-md bg-gray-100 px-3 py-1 text-xs text-foreground/30 text-center truncate">
          {title}
        </div>
        <button onClick={onRefresh} className="text-foreground/30 hover:text-foreground transition-colors" title="Обновить">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 1v4h4" /><path d="M13 13v-4h-4" />
            <path d="M11.5 5A5.5 5.5 0 0 0 2 3.5L1 5" /><path d="M2.5 9A5.5 5.5 0 0 0 12 10.5L13 9" />
          </svg>
        </button>
      </div>
    </div>
  );
}
