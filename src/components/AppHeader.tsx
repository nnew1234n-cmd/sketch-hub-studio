import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, Gauge, MessagesSquare, Users, Terminal, PenLine } from "lucide-react";
import { api } from "@/lib/api";
import { StatusDot } from "@/components/sketch/Sketch";

const tabs = [
  { to: "/", label: "Chat Studio", icon: MessagesSquare },
  { to: "/threads", label: "Threads", icon: Activity },
  { to: "/users", label: "Directory", icon: Users },
  { to: "/actions", label: "Action Logs", icon: Terminal },
] as const;

export function AppHeader() {
  const health = useQuery({ queryKey: ["health"], queryFn: api.health, refetchInterval: 30000 });
  const stats = useQuery({ queryKey: ["stats"], queryFn: api.stats, refetchInterval: 30000 });

  return (
    <header className="border-ink bg-background/80 sticky top-0 z-20 border-b-2 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="sketch-pill border-ink bg-paper flex h-9 w-9 items-center justify-center border-2">
            <PenLine className="text-primary h-4 w-4" />
          </span>
          <span className="font-sketch text-ink text-lg leading-none">
            Sketch-Core
            <span className="text-muted-foreground block text-[10px] tracking-wide">
              support &amp; action control hub
            </span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          {tabs.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="sketch-pill wobble text-ink flex items-center gap-1.5 px-3 py-1.5 text-sm"
              activeOptions={{ exact: t.to === "/" }}
              activeProps={{ className: "bg-primary text-primary-foreground sketch-shadow" }}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <div className="sketch-pill bg-paper px-3 py-1.5">
            <StatusDot
              ok={health.data?.status === "ok"}
              label={
                health.isLoading
                  ? "checking…"
                  : `${health.data?.status ?? "down"} · v${health.data?.version ?? "?"}`
              }
            />
          </div>
          <div className="text-muted-foreground hidden items-center gap-3 text-xs md:flex">
            <span className="flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" />
              {stats.data ? `${stats.data.avg_latency_ms}ms avg` : "—"}
            </span>
            <span>{stats.data ? `${stats.data.tool_calls} tool calls` : "—"}</span>
            <span>
              {stats.data ? `${Math.round(stats.data.success_rate * 1000) / 10}% success` : "—"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}