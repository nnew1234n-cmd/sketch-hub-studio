/**
 * Centralized API client for the Sketch-Core Support & Action Control Hub.
 * Every endpoint has a rich mock fallback so the UI works offline.
 */

export type ChatRole = "user" | "assistant" | "system" | "tool";

export interface ChatMessageIn {
  role: ChatRole;
  content: string;
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output?: unknown;
  status: "running" | "success" | "error";
}

export interface ChatMessage extends ChatMessageIn {
  id: string;
  createdAt?: string;
  toolCalls?: ToolCall[];
}

export interface ThreadSummary {
  thread_id: string;
  title: string;
  user_id: string;
  message_count: number;
  updated_at: string;
}

export interface ThreadDetail extends ThreadSummary {
  messages: ChatMessage[];
  state: Record<string, unknown>;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  active: boolean;
  last_seen: string;
}

export interface ActionLog {
  id: string;
  tool: string;
  status: "success" | "error" | "running";
  duration_ms: number;
  created_at: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
}

export interface HealthStatus {
  status: "ok" | "degraded" | "down";
  version: string;
  uptime_s: number;
  mocked?: boolean;
}

export interface AgentStats {
  threads: number;
  messages: number;
  tool_calls: number;
  avg_latency_ms: number;
  success_rate: number;
  tokens_today: number;
}

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const BASE = "";

function qs(params: Record<string, unknown>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

async function request<T>(path: string, fallback: () => T, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    });
    if (res.status === 422) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError("Validation failed (422)", 422, body?.detail);
    }
    if (!res.ok) throw new ApiError(`Request failed (${res.status})`, res.status);
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError && err.status === 422) throw err;
    // Network / backend absent -> mock fallback
    return fallback();
  }
}

/* ------------------------------ mock data ------------------------------ */

const MOCK_USERS: UserRecord[] = [
  { id: "u_001", name: "Ada Whitfield", email: "ada@sketchcore.io", department: "Engineering", role: "Staff Engineer", active: true, last_seen: "2026-08-15T14:02:00Z" },
  { id: "u_002", name: "Marcus Ling", email: "marcus@sketchcore.io", department: "Support", role: "Tier 2 Agent", active: true, last_seen: "2026-08-15T15:41:00Z" },
  { id: "u_003", name: "Priya Raman", email: "priya@sketchcore.io", department: "Operations", role: "Ops Lead", active: false, last_seen: "2026-07-30T09:12:00Z" },
  { id: "u_004", name: "Jonas Bergstrom", email: "jonas@sketchcore.io", department: "Engineering", role: "Platform Engineer", active: true, last_seen: "2026-08-15T11:20:00Z" },
  { id: "u_005", name: "Lena Ortiz", email: "lena@sketchcore.io", department: "Security", role: "Analyst", active: true, last_seen: "2026-08-14T18:05:00Z" },
  { id: "u_006", name: "Toby Nakamura", email: "toby@sketchcore.io", department: "Support", role: "Tier 1 Agent", active: false, last_seen: "2026-08-02T07:55:00Z" },
  { id: "u_007", name: "Fatima Al-Sayed", email: "fatima@sketchcore.io", department: "Operations", role: "Scheduler", active: true, last_seen: "2026-08-15T16:00:00Z" },
  { id: "u_008", name: "Grant Mueller", email: "grant@sketchcore.io", department: "Security", role: "Incident Commander", active: true, last_seen: "2026-08-13T22:31:00Z" },
];

const MOCK_ACTIONS: ActionLog[] = Array.from({ length: 34 }, (_, i) => {
  const tools = ["lookup_user", "reset_password", "open_ticket", "search_kb", "escalate_incident", "grant_access"];
  const tool = tools[i % tools.length];
  const status = i % 9 === 0 ? "error" : i % 13 === 0 ? "running" : "success";
  return {
    id: `act_${(1000 + i).toString()}`,
    tool,
    status: status as ActionLog["status"],
    duration_ms: 120 + ((i * 137) % 1800),
    created_at: new Date(Date.UTC(2026, 7, 15, 16, 0) - i * 1000 * 60 * 37).toISOString(),
    input: { query: `${tool}:${i}`, actor: MOCK_USERS[i % MOCK_USERS.length].email },
    output:
      status === "error"
        ? { error: "upstream_timeout", retryable: true }
        : { ok: true, records: (i % 5) + 1, ref: `ref_${i * 7}` },
  };
});

const MOCK_THREADS: ThreadSummary[] = [
  { thread_id: "th_a91f", title: "VPN access for contractor", user_id: "u_002", message_count: 8, updated_at: "2026-08-15T15:44:00Z" },
  { thread_id: "th_77c2", title: "Payroll export failing", user_id: "u_007", message_count: 14, updated_at: "2026-08-15T12:10:00Z" },
  { thread_id: "th_3b0d", title: "Onboard Lena to Security group", user_id: "u_005", message_count: 5, updated_at: "2026-08-14T19:22:00Z" },
  { thread_id: "th_51ee", title: "Escalation: prod latency spike", user_id: "u_008", message_count: 21, updated_at: "2026-08-13T23:04:00Z" },
  { thread_id: "th_2ac6", title: "Password reset loop", user_id: "u_006", message_count: 6, updated_at: "2026-08-12T08:47:00Z" },
];

function mockThreadDetail(id: string): ThreadDetail {
  const summary = MOCK_THREADS.find((t) => t.thread_id === id) ?? MOCK_THREADS[0];
  return {
    ...summary,
    thread_id: id,
    state: { status: "open", priority: "normal", assigned_tool_budget: 12, last_tool: "lookup_user" },
    messages: [
      { id: "m1", role: "system", content: "You are Sketch-Core, an autonomous support agent with tool access." },
      { id: "m2", role: "user", content: `Can you help with: ${summary.title}?` },
      {
        id: "m3",
        role: "tool",
        content: "lookup_user executed",
        toolCalls: [
          {
            id: "tc1",
            name: "lookup_user",
            status: "success",
            input: { user_id: summary.user_id },
            output: { found: true, department: "Support", active: true },
          },
        ],
      },
      { id: "m4", role: "assistant", content: "I found the record and applied the requested change. Anything else?" },
    ],
  };
}

/* ------------------------------ endpoints ------------------------------ */

export const api = {
  health: () =>
    request<HealthStatus>("/api/health", () => ({
      status: "ok",
      version: "1.4.2-mock",
      uptime_s: 483920,
      mocked: true,
    })),

  stats: () =>
    request<AgentStats>("/api/stats", () => ({
      threads: 128,
      messages: 3421,
      tool_calls: 892,
      avg_latency_ms: 640,
      success_rate: 0.973,
      tokens_today: 184300,
    })),

  listThreads: (limit = 100) =>
    request<ThreadSummary[]>(`/api/threads${qs({ limit })}`, () => MOCK_THREADS.slice(0, limit)),

  getThread: (threadId: string) =>
    request<ThreadDetail>(`/api/threads/${threadId}`, () => mockThreadDetail(threadId)),

  deleteThread: (threadId: string) =>
    request<{ deleted: boolean; thread_id: string }>(
      `/api/threads/${threadId}`,
      () => ({ deleted: true, thread_id: threadId }),
      { method: "DELETE" },
    ),

  listUsers: (params: { department?: string; role?: string; active?: boolean; query?: string } = {}) =>
    request<UserRecord[]>(`/api/users${qs(params)}`, () =>
      MOCK_USERS.filter((u) => {
        if (params.department && u.department !== params.department) return false;
        if (params.role && !u.role.toLowerCase().includes(params.role.toLowerCase())) return false;
        if (params.active !== undefined && u.active !== params.active) return false;
        if (params.query) {
          const q = params.query.toLowerCase();
          if (!`${u.name} ${u.email} ${u.role} ${u.department}`.toLowerCase().includes(q)) return false;
        }
        return true;
      }),
    ),

  listActions: (params: { tool?: string; limit?: number; offset?: number } = {}) => {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;
    return request<{ items: ActionLog[]; total: number }>(
      `/api/actions${qs({ tool: params.tool, limit, offset })}`,
      () => {
        const filtered = params.tool
          ? MOCK_ACTIONS.filter((a) => a.tool.toLowerCase().includes(params.tool!.toLowerCase()))
          : MOCK_ACTIONS;
        return { items: filtered.slice(offset, offset + limit), total: filtered.length };
      },
    );
  },

  departments: () => Array.from(new Set(MOCK_USERS.map((u) => u.department))),
  knownTools: () => Array.from(new Set(MOCK_ACTIONS.map((a) => a.tool))),
};

/* --------------------------- streaming chat --------------------------- */

export interface ChatStreamHandlers {
  onText: (delta: string) => void;
  onTool?: (call: ToolCall) => void;
  onDone?: () => void;
  onError?: (err: unknown) => void;
}

export async function streamChat(
  body: { messages: ChatMessageIn[]; thread_id?: string; user_id?: string },
  handlers: ChatStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
    if (res.status === 422) {
      const detail = await res.json().catch(() => ({}));
      throw new ApiError("Validation failed (422)", 422, detail?.detail);
    }
    if (!res.ok || !res.body) throw new ApiError(`Chat failed (${res.status})`, res.status);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const evt = JSON.parse(payload);
          if (evt.type === "text-delta" && typeof evt.delta === "string") handlers.onText(evt.delta);
          else if (evt.type === "tool-result" || evt.type === "tool-call") {
            handlers.onTool?.({
              id: evt.toolCallId ?? crypto.randomUUID(),
              name: evt.toolName ?? "tool",
              input: evt.input ?? evt.args ?? {},
              output: evt.output ?? evt.result,
              status: evt.type === "tool-result" ? "success" : "running",
            });
          }
        } catch {
          handlers.onText(payload);
        }
      }
    }
    handlers.onDone?.();
  } catch (err) {
    if (err instanceof ApiError && err.status === 422) {
      handlers.onError?.(err);
      return;
    }
    if ((err as Error)?.name === "AbortError") return;
    await mockStream(body, handlers, signal);
  }
}

async function mockStream(
  body: { messages: ChatMessageIn[] },
  handlers: ChatStreamHandlers,
  signal?: AbortSignal,
) {
  const last = body.messages[body.messages.length - 1]?.content ?? "";
  handlers.onTool?.({
    id: crypto.randomUUID(),
    name: "search_kb",
    status: "success",
    input: { query: last.slice(0, 60) },
    output: { hits: 3, top_article: "KB-1042 — Access provisioning runbook" },
  });
  const reply =
    `Working offline against mock data. I parsed your request "${last.slice(0, 80)}", ` +
    `queried the knowledge base, and cross-checked the user directory. ` +
    `Recommended next step: open a ticket and grant temporary scoped access for 24 hours, ` +
    `then re-run the audit tool to confirm the change landed cleanly.`;
  const words = reply.split(" ");
  for (const w of words) {
    if (signal?.aborted) return;
    await new Promise((r) => setTimeout(r, 28));
    handlers.onText(w + " ");
  }
  handlers.onDone?.();
}