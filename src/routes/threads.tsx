import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, RefreshCw, MessageSquareText } from "lucide-react";
import { api } from "@/lib/api";
import { AppHeader } from "@/components/AppHeader";
import {
  GridBackdrop,
  RoleBadge,
  SketchButton,
  SketchPanel,
  SketchTitle,
} from "@/components/sketch/Sketch";

export const Route = createFileRoute("/threads")({
  head: () => ({
    meta: [
      { title: "Threads & Sessions — Sketch-Core Hub" },
      {
        name: "description",
        content: "Browse, inspect, and delete agent thread sessions with full message history.",
      },
      { property: "og:title", content: "Threads & Sessions — Sketch-Core Hub" },
      {
        property: "og:description",
        content: "Browse, inspect, and delete agent thread sessions with full message history.",
      },
    ],
  }),
  component: ThreadsPage,
});

function ThreadsPage() {
  const qc = useQueryClient();
  const [limit, setLimit] = useState(100);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const threads = useQuery({ queryKey: ["threads", limit], queryFn: () => api.listThreads(limit) });
  const detail = useQuery({
    queryKey: ["thread", selected],
    queryFn: () => api.getThread(selected!),
    enabled: !!selected,
  });

  async function doDelete(id: string) {
    try {
      await api.deleteThread(id);
      toast.success(`Thread ${id} deleted`);
      if (selected === id) setSelected(null);
      qc.invalidateQueries({ queryKey: ["threads"] });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setConfirming(null);
    }
  }

  return (
    <div className="min-h-screen">
      <GridBackdrop />
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <SketchTitle>Threads &amp; Sessions</SketchTitle>
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <SketchPanel className="p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="font-sketch text-sm">limit</span>
              <input
                type="number"
                value={limit}
                min={1}
                onChange={(e) => setLimit(Number(e.target.value) || 1)}
                className="sketch-pill w-20 px-2 py-1 text-sm outline-none"
              />
              <SketchButton onClick={() => threads.refetch()}>
                <RefreshCw className="h-3.5 w-3.5" />
              </SketchButton>
            </div>
            <ul className="space-y-2">
              {threads.data?.map((t) => (
                <li key={t.thread_id}>
                  <button
                    onClick={() => setSelected(t.thread_id)}
                    className={`sketch-box wobble w-full p-3 text-left ${
                      selected === t.thread_id ? "bg-accent" : ""
                    }`}
                  >
                    <div className="text-sm font-medium">{t.title}</div>
                    <div className="text-muted-foreground mt-1 flex justify-between text-xs">
                      <span>{t.thread_id}</span>
                      <span>{t.message_count} msgs</span>
                    </div>
                  </button>
                </li>
              ))}
              {threads.isLoading && <li className="text-muted-foreground text-sm">Loading…</li>}
            </ul>
          </SketchPanel>

          <SketchPanel alt className="p-5">
            {!selected && (
              <div className="text-muted-foreground flex h-64 flex-col items-center justify-center gap-2 text-sm">
                <MessageSquareText className="h-8 w-8" />
                Select a thread to inspect its history and state.
              </div>
            )}
            {selected && detail.data && (
              <div>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg">{detail.data.title}</h3>
                    <p className="text-muted-foreground text-xs">
                      {detail.data.thread_id} · user {detail.data.user_id} · updated{" "}
                      {new Date(detail.data.updated_at).toLocaleString()}
                    </p>
                  </div>
                  <SketchButton variant="danger" onClick={() => setConfirming(selected)}>
                    <span className="inline-flex items-center gap-1.5">
                      <Trash2 className="h-3.5 w-3.5" /> Delete thread
                    </span>
                  </SketchButton>
                </div>

                <div className="mb-5">
                  <div className="font-sketch mb-2 text-sm">state</div>
                  <pre className="sketch-box bg-background overflow-auto p-3 text-xs">
                    {JSON.stringify(detail.data.state, null, 2)}
                  </pre>
                </div>

                <div className="space-y-3">
                  {detail.data.messages.map((m) => (
                    <div key={m.id} className="sketch-box bg-background p-3">
                      <RoleBadge role={m.role} />
                      <p className="mt-2 text-sm whitespace-pre-wrap">{m.content}</p>
                      {m.toolCalls?.map((tc) => (
                        <pre
                          key={tc.id}
                          className="sketch-pill border-primary mt-2 overflow-auto p-2 text-xs"
                        >
                          {tc.name}: {JSON.stringify(tc.output)}
                        </pre>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SketchPanel>
        </div>
      </main>

      {confirming && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 p-4">
          <SketchPanel className="max-w-sm p-6">
            <h3 className="text-lg">Delete this thread?</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Thread <span className="font-mono">{confirming}</span> and its message history will be
              removed. This can't be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <SketchButton onClick={() => setConfirming(null)}>Cancel</SketchButton>
              <SketchButton variant="danger" onClick={() => doDelete(confirming)}>
                Delete
              </SketchButton>
            </div>
          </SketchPanel>
        </div>
      )}
    </div>
  );
}