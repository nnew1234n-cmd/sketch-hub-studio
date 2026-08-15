import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SketchPanel({
  children,
  className,
  alt,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  alt?: boolean;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        alt ? "sketch-box-alt" : "sketch-box",
        "sketch-shadow",
        hover && "wobble",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SketchButton({
  children,
  className,
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "accent" | "danger" }) {
  return (
    <button
      {...props}
      className={cn(
        "sketch-pill sketch-shadow wobble px-4 py-1.5 text-sm font-medium disabled:opacity-50 disabled:hover:transform-none",
        variant === "default" && "bg-paper text-ink",
        variant === "accent" && "bg-primary text-primary-foreground",
        variant === "danger" && "bg-destructive text-destructive-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SketchInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "sketch-pill bg-background placeholder:text-muted-foreground focus:ring-ring w-full px-3 py-1.5 text-sm outline-none focus:ring-2",
        className,
      )}
    />
  );
}

export function SketchSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "sketch-pill bg-background focus:ring-ring px-3 py-1.5 text-sm outline-none focus:ring-2",
        className,
      )}
    >
      {children}
    </select>
  );
}

export function SketchTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-4", className)}>
      <h2 className="text-ink text-xl">{children}</h2>
      <UnderlineScribble />
    </div>
  );
}

export function UnderlineScribble({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 10" className={cn("h-2 w-40", className)} fill="none" aria-hidden>
      <motion.path
        d="M2 6 C 40 1, 70 9, 110 4 S 190 2, 218 7"
        stroke="var(--primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
      />
    </svg>
  );
}

export function GridBackdrop() {
  const dots = [
    { l: "8%", t: "18%", d: 0 },
    { l: "26%", t: "62%", d: 1.2 },
    { l: "54%", t: "12%", d: 2.1 },
    { l: "72%", t: "48%", d: 0.6 },
    { l: "88%", t: "78%", d: 1.8 },
    { l: "38%", t: "88%", d: 2.6 },
  ];
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="paper-grid absolute inset-0 opacity-60" />
      {dots.map((p, i) => (
        <motion.span
          key={i}
          className="border-primary/50 absolute h-3 w-3 rounded-full border-2"
          style={{ left: p.l, top: p.t }}
          animate={{ y: [0, -18, 0], x: [0, 8, 0], opacity: [0.25, 0.7, 0.25] }}
          transition={{ duration: 9 + i, repeat: Infinity, delay: p.d, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    user: "bg-background text-ink",
    assistant: "bg-accent text-accent-foreground",
    system: "bg-muted text-muted-foreground",
    tool: "bg-primary text-primary-foreground",
  };
  return (
    <span
      className={cn(
        "sketch-pill px-2.5 py-0.5 font-sketch text-xs",
        map[role] ?? "bg-background text-ink",
      )}
    >
      {role}
    </span>
  );
}

export function StatusDot({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span
        className={cn(
          "border-ink h-2.5 w-2.5 rounded-full border-2",
          ok ? "bg-primary" : "bg-destructive",
        )}
      />
      {label}
    </span>
  );
}