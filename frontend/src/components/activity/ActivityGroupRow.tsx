import { useState } from "react";
import type { AgentActivity } from "../../hooks/useActivities";
import { relativeTime } from "../../lib/format";
import { ActivityRow } from "./ActivityRow";

const typeConfig: Record<
  AgentActivity["type"],
  { label: string; colorClass: string; dotClass: string; bgClass: string }
> = {
  heartbeat: {
    label: "Heartbeat",
    colorClass: "text-green-500",
    dotClass: "bg-green-500 shadow-[0_0_6px_#22c55e]",
    bgClass: "bg-green-500/10",
  },
  strategy: {
    label: "Strategy",
    colorClass: "text-amber-500",
    dotClass: "bg-amber-500 shadow-[0_0_6px_#f59e0b]",
    bgClass: "bg-amber-500/10",
  },
  error: {
    label: "Error",
    colorClass: "text-red-500",
    dotClass: "bg-red-500 shadow-[0_0_6px_#ef4444]",
    bgClass: "bg-red-500/10",
  },
};

export function ActivityGroupRow({ activities }: { activities: AgentActivity[] }) {
  const [expanded, setExpanded] = useState(false);
  const first = activities[0];
  const config = typeConfig[first.type];

  return (
    <div className="border-b border-subtle">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="group flex w-full items-center gap-3 px-3 py-3 sm:px-4 transition-colors hover:bg-elevated text-left"
      >
        {/* Type badge */}
        <span
          className={`flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 ${config.bgClass}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
          <span
            className={`text-[10px] font-semibold uppercase tracking-wide ${config.colorClass}`}
            style={{ fontFamily: "var(--font-body)" }}
          >
            {config.label}
          </span>
        </span>

        {/* Count + chevron */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="flex h-5 items-center rounded-md bg-neutral-800 px-1.5 text-[10px] font-medium text-zinc-400">
            {activities.length}
          </span>
          <svg
            className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <span className="shrink-0 text-xs text-zinc-500">
          {relativeTime(first.timestamp)}
        </span>
      </button>

      {expanded && (
        <div className="bg-neutral-950/50">
          {activities.map((act) => (
            <ActivityRow key={act.id} activity={act} nested />
          ))}
        </div>
      )}
    </div>
  );
}
