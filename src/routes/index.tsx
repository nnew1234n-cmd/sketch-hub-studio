import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send, Square, ChevronDown, Wrench } from "lucide-react";
import { api, streamChat, ApiError, type ChatMessage, type ToolCall } from "@/lib/api";
import { AppHeader } from "@/components/AppHeader";
import {
  GridBackdrop,
  RoleBadge,
  SketchButton,
  SketchInput,
  SketchPanel,
  SketchSelect,
  SketchTitle,
} from "@/components/sketch/Sketch";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agent Chat Studio — Sketch-Core Support Hub" },
      {
        name: "description",
        content:
          "Stream autonomous support-agent responses with live tool-call traces in a hand-sketched control hub.",
      },
      { property: "og:title", content: "Agent Chat Studio — Sketch-Core Support Hub" },
      {
        property: "og:description",
        content:
          "Stream autonomous support-agent responses with live tool-call traces in a hand-sketched control hub.",
      },
    ],
  }),
  component: ChatStudio,
});

function ToolAccordion({ call }: { call: ToolCall }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="sketch-box-alt bg-background mt-2 p-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 text-left text-sm"
      >
        <Wrench className="text-primary h-4 w-4" />
        <span className="font-mono">{call.name}</span>
        <span className="sketch-pill bg-accent text-accent-foreground px-2 py-0.5 text-[11px]">
          {call.status}
        </span>
        <ChevronDown
          className={`ml-auto h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <pre className="sketch-box p-2 text-[11px] overflow-auto">
            {JSON.stringify(call.input, null, 2)}
          </pre>
          <pre className="sketch-box p-2 text-[11px] overflow-auto">
            {JSON.stringify(call.output ?? {}, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function ChatStudio() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "sys",
      role: "system",
      content: "Sketch-Core agent online. Tools: lookup_user, search_kb, open_ticket, grant_access.",
    },
  ]);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState("");
  const [userId, setUserId] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const threads = useQuery({ queryKey: ["threads", 100], queryFn: () => api.listThreads(100) });
  const users = useQuery({ queryKey: ["users", "all"], queryFn: () => api.listUsers({}) });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    const assistantId = crypto.randomUUID();
    setMessages((m) => [
      ...m,
      userMsg,
      { id: assistantId, role: "assistant", content: "", toolCalls: [] },
    ]);
    setInput("");
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    await streamChat(
      {
        messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        ...(threadId ? { thread_id: threadId } : {}),
        ...(userId ? { user_id: userId } : {}),
      },
      {
        onText: (delta) =>
          setMessages((m) =>
            m.map((x) => (x.id === assistantId ? { ...x, content: x.content + delta } : x)),
          ),
        onTool: (call) =>
          setMessages((m) =>
            m.map((x) =>
              x.id === assistantId ? { ...x, toolCalls: [...(x.toolCalls ?? []), call] } : x,
            ),
          ),
        onError: (err) =>
          toast.error(
            err instanceof ApiError && err.status === 422
              ? "Validation error (422): check thread/user context"
              : "Network failure — falling back to offline mock",
          ),
        onDone: () => setStreaming(false),
      },
      controller.signal,
    );
    setStreaming(false);
  }

  return (
    <div className="min-h-screen">
      <GridBackdrop />
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <SketchTitle>Autonomous Agent Chat Studio</SketchTitle>

        <SketchPanel className="mb-5 flex flex-wrap items-center gap-3 p-4">
          <SketchSelect value={threadId} onChange={(e) => setThreadId(e.target.value)}>
            <option value="">New thread</option>
            {threads.data?.map((t) => (
              <option key={t.thread_id} value={t.thread_id}>
                {t.title} ({t.thread_id})
              </option>
            ))}
          </SketchSelect>
          <SketchSelect value={userId} onChange={(e) => setUserId(e.target.value)}>
            <option value="">No user context</option>
            {users.data?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </SketchSelect>
          <span className="text-muted-foreground ml-auto text-xs">
            POST /api/chat · SSE stream
          </span>
        </SketchPanel>

        <SketchPanel alt className="min-h-[420px] p-5">
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className="sketch-box bg-background p-3">
                <RoleBadge role={m.role} />
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                  {m.content}
                  {streaming && m.role === "assistant" && !m.content && (
                    <span className="text-muted-foreground">thinking…</span>
                  )}
                  {streaming && m.role === "assistant" && m.content && (
                    <span className="bg-ink ml-0.5 inline-block h-4 w-[2px] animate-pulse align-middle" />
                  )}
                </p>
                {m.toolCalls?.map((tc) => <ToolAccordion key={tc.id} call={tc} />)}
              </div>
            ))}
            <div ref={endRef} />
          </div>
        </SketchPanel>

        <div className="mt-4 flex items-center gap-3">
          <SketchInput
            placeholder="Ask the agent to run a tool, look up a user, or resolve a ticket…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void send();
            }}
          />
          {streaming ? (
            <SketchButton
              variant="danger"
              onClick={() => {
                abortRef.current?.abort();
                setStreaming(false);
              }}
            >
              <Square className="h-4 w-4" />
            </SketchButton>
          ) : (
            <SketchButton variant="accent" onClick={() => void send()}>
              <span className="inline-flex items-center gap-1.5">
                <Send className="h-4 w-4" /> Send
              </span>
            </SketchButton>
          )}
        </div>
      </main>
    </div>
  );
}