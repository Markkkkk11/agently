export interface ChatMessage {
  id: string;
  agent_type: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata_: Record<string, unknown> | null;
  created_at: string;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  total: number;
}

export interface SSEStartEvent {
  type: "start";
  message_id: string;
}

export interface SSEChunkEvent {
  type: "chunk";
  content: string;
}

export interface SSEEndEvent {
  type: "end";
  content: string;
  metadata: Record<string, unknown>;
}

export interface SSEErrorEvent {
  type: "error";
  content: string;
}

export interface SSEImageEvent {
  type: "image";
  image: {
    filename: string;
    path: string;
    size: number;
  };
}

export type SSEEvent = SSEStartEvent | SSEChunkEvent | SSEEndEvent | SSEErrorEvent | SSEImageEvent;
