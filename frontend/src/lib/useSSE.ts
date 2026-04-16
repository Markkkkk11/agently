import { useState, useCallback, useRef } from "react";
import type { SSEEvent } from "@/types/chat";

const API_BASE = "/api/v1";

export interface GeneratedImage {
  filename: string;
  path: string;
  size: number;
}

interface SSEResult {
  content: string;
  metadata: Record<string, unknown>;
  images: GeneratedImage[];
}

interface UseSSEReturn {
  streamingContent: string;
  isStreaming: boolean;
  generatedImages: GeneratedImage[];
  sendMessage: (url: string, content: string, model?: string) => Promise<SSEResult>;
  abort: () => void;
}

export function useSSE(): UseSSEReturn {
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(
    async (url: string, content: string, model?: string): Promise<SSEResult> => {
      const token = localStorage.getItem("access_token");
      const controller = new AbortController();
      abortRef.current = controller;

      setStreamingContent("");
      setIsStreaming(true);
      setGeneratedImages([]);

      let fullContent = "";
      let metadata: Record<string, unknown> = {};
      const images: GeneratedImage[] = [];

      try {
        const response = await fetch(`${API_BASE}${url}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ content, model: model || undefined }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const event: SSEEvent = JSON.parse(jsonStr);

              if (event.type === "error") {
                metadata = { error: true };
                fullContent = event.content;
                setStreamingContent(fullContent);
              } else if (event.type === "chunk") {
                fullContent += event.content;
                setStreamingContent(fullContent);
              } else if (event.type === "image") {
                images.push(event.image);
                setGeneratedImages([...images]);
              } else if (event.type === "end") {
                fullContent = event.content;
                metadata = event.metadata;
                setStreamingContent(fullContent);
              }
            } catch {
              // skip malformed JSON lines
            }
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // user aborted
        } else {
          throw err;
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }

      return { content: fullContent, metadata, images };
    },
    []
  );

  return { streamingContent, isStreaming, generatedImages, sendMessage, abort };
}
