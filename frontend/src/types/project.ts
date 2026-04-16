export interface ProjectAgent {
  agent_type: string;
  name: string;
  icon: string;
  status: string;
  task_completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  agents: ProjectAgent[];
  agents_count: number;
  created_at: string;
}

export interface RecommendedAgent {
  type: string;
  reason: string;
}

export interface ProjectCreateResult {
  id: string;
  name: string;
  description: string | null;
  status: string;
  recommended_agents: RecommendedAgent[];
  created_at: string;
}

export interface AgentTemplate {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  base_price: number;
  capabilities: string[];
}
