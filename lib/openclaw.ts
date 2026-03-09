import { prisma } from "./prisma";

export interface OpenclawConfig {
  baseUrl: string;
  authToken: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  agentId: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export class OpenclawClient {
  private config: OpenclawConfig;

  constructor(config: OpenclawConfig) {
    this.config = config;
  }

  private headers(): HeadersInit {
    return {
      "Content-Type": "application/json",
      ...(this.config.authToken
        ? { Authorization: `Bearer ${this.config.authToken}` }
        : {}),
    };
  }

  async chat(request: ChatRequest): Promise<unknown> {
    const resp = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        model: `openclaw:${request.agentId}`,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`openclaw chat error ${resp.status}: ${text}`);
    }
    return resp.json();
  }

  async invokeTool(toolName: string, args: Record<string, unknown> = {}): Promise<unknown> {
    const resp = await fetch(`${this.config.baseUrl}/tools/invoke`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        tool: toolName,
        action: "json",
        args,
        sessionKey: "main",
        dryRun: false,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`openclaw tool error ${resp.status}: ${text}`);
    }
    return resp.json();
  }

  async ping(): Promise<boolean> {
    try {
      await this.invokeTool("sessions_list");
      return true;
    } catch {
      return false;
    }
  }

  async listAgents(): Promise<Array<{ id: string; name: string }>> {
    try {
      const result = await this.invokeTool("sessions_list") as unknown;
      if (Array.isArray(result)) {
        return result.map((s: unknown) => {
          const session = s as Record<string, unknown>;
          return {
            id: String(session.key ?? session.id ?? ""),
            name: String(session.name ?? session.key ?? session.id ?? ""),
          };
        });
      }
      return [];
    } catch {
      return [];
    }
  }
}

export async function getOpenclawClient(): Promise<OpenclawClient> {
  let baseUrl = process.env.OPENCLAW_URL ?? "http://127.0.0.1:18789";
  let authToken = process.env.OPENCLAW_TOKEN ?? "";

  try {
    const settings = await prisma.settings.findMany({
      where: { key: { in: ["gatewayUrl", "authToken"] } },
    });
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    if (map.gatewayUrl) baseUrl = map.gatewayUrl;
    if (map.authToken) authToken = map.authToken;
  } catch {
    // fallback to env vars
  }

  return new OpenclawClient({ baseUrl, authToken });
}
