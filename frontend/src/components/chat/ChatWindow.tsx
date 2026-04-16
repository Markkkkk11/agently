"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "@/types/chat";

interface ChatWindowProps {
  messages: ChatMessage[];
  streamingContent: string;
  isStreaming: boolean;
  agentName: string;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function stripCode(text: string): string {
  // Remove closed code/image blocks
  let result = text.replace(/```(?:html|image|js|css|json)?[\s\S]*?```/g, "");
  // Remove unclosed code block (streaming — agent is still writing code)
  result = result.replace(/```[\s\S]*$/g, "");
  // Remove inline code
  result = result.replace(/`[^`\n]+`/g, "");
  result = result.replace(/\n{3,}/g, "\n\n");
  return result.trim();
}

export default function ChatWindow({
  messages,
  streamingContent,
  isStreaming,
  agentName,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      {messages.length === 0 && !isStreaming && (
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-light">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="text-foreground/30 text-sm text-center">
            Начните диалог с {agentName}
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isStreaming && streamingContent && (() => {
        const stripped = stripCode(streamingContent);
        const hasVisibleText = stripped.length > 0;
        return hasVisibleText ? (
          <div className="flex justify-start">
            <div className="max-w-[75%] rounded-card bg-white border border-border/50 p-4 shadow-card">
              <div className="prose prose-sm max-w-none text-foreground">
                <ReactMarkdown>{stripped}</ReactMarkdown>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse [animation-delay:300ms]" />
                </div>
                <span className="text-xs text-foreground/30">печатает</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-start">
            <div className="rounded-card bg-white border border-border/50 px-4 py-3 shadow-card">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse [animation-delay:300ms]" />
                </div>
                <span className="text-foreground/30 text-sm">Работаю над сайтом...</span>
              </div>
            </div>
          </div>
        );
      })()}

      {isStreaming && !streamingContent && (
        <div className="flex justify-start">
          <div className="rounded-card bg-white border border-border/50 px-4 py-3 shadow-card">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse [animation-delay:300ms]" />
              </div>
              <span className="text-foreground/30 text-sm">Думаю...</span>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const displayContent = isUser ? message.content : stripCode(message.content);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="mr-2 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent-light">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      )}
      <div
        className={`max-w-[70%] rounded-card p-4 ${
          isUser
            ? "bg-accent text-white shadow-sm"
            : "bg-white border border-border/50 text-foreground shadow-card"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm">{displayContent}</p>
        ) : (
          <div className="prose prose-sm max-w-none text-foreground">
            <ReactMarkdown>{displayContent}</ReactMarkdown>
          </div>
        )}
        <p
          className={`mt-2 text-[10px] ${
            isUser ? "text-white/50" : "text-foreground/25"
          }`}
        >
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}
