import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, UserRound, CircleDot } from "lucide-react";
import { api } from "@/lib/api";
import { AppHeader } from "@/components/AppHeader";
import {
  GridBackdrop,
  SketchInput,
  SketchPanel,
  SketchSelect,
  SketchTitle,
} from "@/components/sketch/Sketch";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "User Directory & Access Control — Sketch-Core Hub" },
      {
        name: "description",
        content: "Search and filter user records by department, role, and active state.",
      },
      { property: "og:title", content: "User Directory & Access Control — Sketch-Core Hub" },
      {
        property: "og:description",
        content: "Search and filter user records by department, role, and active state.",
      },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [query, setQuery] = useState("");

  const users = useQuery({
    queryKey: ["users", department, role, activeOnly, query],
    queryFn: () =>
      api.listUsers({
        ...(department ? { department } : {}),
        ...(role ? { role } : {}),
        ...(activeOnly ? { active: true } : {}),
        ...(query ? { query } : {}),
      }),
  });

  return (
    <div className="min-h-screen">
      <GridBackdrop />
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <SketchTitle>User Directory &amp; Access Control</SketchTitle>

        <SketchPanel className="mb-6 flex flex-wrap items-center gap-3 p-4">
          <SketchSelect value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">All departments</option>
            {api.departments().map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </SketchSelect>
          <SketchInput
            className="max-w-48"
            placeholder="Role contains…"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <label className="sketch-pill flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="accent-primary"
            />
            Active only
          </label>
          <div className="relative min-w-56 flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
            <SketchInput
              className="pl-9"
              placeholder="Search name, email, role…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </SketchPanel>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.data?.map((u) => (
            <SketchPanel key={u.id} hover alt className="p-4">
              <div className="flex items-start gap-3">
                <span className="sketch-pill border-ink flex h-10 w-10 items-center justify-center border-2">
                  <UserRound className="text-primary h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{u.name}</div>
                  <div className="text-muted-foreground truncate text-xs">{u.email}</div>
                </div>
                <span className="ml-auto inline-flex items-center gap-1 text-xs">
                  <CircleDot
                    className={`h-3.5 w-3.5 ${u.active ? "text-primary" : "text-muted-foreground"}`}
                  />
                  {u.active ? "active" : "inactive"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="sketch-pill bg-accent text-accent-foreground px-2.5 py-0.5 text-xs">
                  {u.role}
                </span>
                <span className="sketch-pill bg-background px-2.5 py-0.5 text-xs">
                  {u.department}
                </span>
              </div>
              <div className="text-muted-foreground mt-3 text-[11px]">
                Last seen {new Date(u.last_seen).toLocaleString()}
              </div>
            </SketchPanel>
          ))}
        </div>
        {users.data?.length === 0 && (
          <p className="text-muted-foreground mt-8 text-center text-sm">
            No users match those filters.
          </p>
        )}
      </main>
    </div>
  );
}