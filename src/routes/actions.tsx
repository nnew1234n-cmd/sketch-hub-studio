import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { AppHeader } from "@/components/AppHeader";
import {
  GridBackdrop,
  SketchButton,
  SketchInput,
  SketchPanel,
  SketchSelect,
  SketchTitle,
} from "@/components/sketch/Sketch";

export const Route = createFileRoute("/actions")({
  head: () => ({
    meta: [
      { title: "Action Execution & Tool Logs — Sketch-Core Hub" },
      {
        name: "description",
        content: "Timeline of agent tool executions with inputs, outputs, status, and latency.",
      },
      { property: "og:title", content: "Action Execution & Tool Logs — Sketch-Core Hub" },
      {
        property: "og:description",
        content: "Timeline of agent tool executions with inputs, outputs, status, and latency.",
      },
    ],
  }),
  component: ActionsPage,
});

const statusIcon = {
  success: <CheckCircle2 className="text-primary h-4 w-4" />,
  error: <XCircle className="text-destructive h-4 w-4" />,
  running: <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />,
};

function ActionsPage() {
  const [tool, setTool] = useState("");
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  const actions = useQuery({
    queryKey: ["actions", tool, limit, offset],
    queryFn: () => api.listActions({ ...(tool ? { tool } : {}), limit, offset }),
  });

  const total = actions.data?.total ?? 0;

  return (
    <div className="min-h-screen">
      <GridBackdrop />
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <SketchTitle>Action Execution &amp; Tool Call Logs</SketchTitle>

        <SketchPanel className="mb-6 flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-56 flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
            <SketchInput
              className="pl-9"
              placeholder="Filter by tool name…"
              value={tool}
              onChange={(e) => {
                setTool(e.target.value);
                setOffset(0);
              }}
            />
          </div>
          <SketchSelect
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setOffset(0);
            }}
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} per page
              </option>
            ))}
          </SketchSelect>
          <div className="flex items-center gap-2">
            <SketchButton disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>
              <ChevronLeft className="h-4 w-4" />
            </SketchButton>
            <span className="text-muted-foreground text-xs">
              {total === 0 ? 0 : offset + 1}–{Math.min(offset + limit, total)} of {total}
            </span>
            <SketchButton
              disabled={offset + limit >= total}
              onClick={() => setOffset(offset + limit)}
            >
              <ChevronRight className="h-4 w-4" />
            </SketchButton>
          </div>
        </SketchPanel>

        <ol className="border-graphite relative space-y-4 border-l-2 pl-6">
          {actions.data?.items.map((a) => (
            <li key={a.id} className="relative">
              <span className="border-ink bg-background absolute top-4 -left-[31px] h-3 w-3 rounded-full border-2" />
              <SketchPanel hover className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {statusIcon[a.status]}
                  <span className="font-mono text-sm font-semibold">{a.tool}</span>
                  <span className="sketch-pill bg-background px-2 py-0.5 text-[11px]">{a.id}</span>
                  <span className="text-muted-foreground ml-auto text-xs">
                    {a.duration_ms}ms · {new Date(a.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="font-sketch mb-1 text-xs">input</div>
                    <pre className="sketch-box bg-background overflow-auto p-2 text-[11px]">
                      {JSON.stringify(a.input, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <div className="font-sketch mb-1 text-xs">output</div>
                    <pre className="sketch-box bg-background overflow-auto p-2 text-[11px]">
                      {JSON.stringify(a.output, null, 2)}
                    </pre>
                  </div>
                </div>
              </SketchPanel>
            </li>
          ))}
        </ol>
        {actions.data?.items.length === 0 && (
          <p className="text-muted-foreground mt-8 text-center text-sm">No matching executions.</p>
        )}
      </main>
    </div>
  );
}