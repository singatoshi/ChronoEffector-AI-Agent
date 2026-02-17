import { useState } from "react";
import type { AgentActivity } from "../../hooks/useActivities";
import { relativeTime } from "../../lib/format";
import { ActivityRow } from "./ActivityRow";

const phaseDotClass: Record<string, string> = {
  inventory: "bg-blue-500",
  survival: "bg-orange-500",
  strategy: "bg-violet-400",
  error: "bg-red-500",
};

export function ActivityGroupRow({ activities }: { activities: AgentActivity[] }) {
  const [expanded, setExpanded] = useState(false);

  // Pick the last activity's summary as the group headline
  const latest = activities[activities.length - 1];
  const phases = [...new Set(activities.map((a) => a.type))];
  const totalTools = activities.reduce((s, a) => s + (a.tools?.length ?? 0), 0);
  const totalTx = activities.reduce((s, a) => s + (a.txHashes?.length ?? 0), 0);

  return (
    <div className="border-b border-subtle">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="group flex w-full items-center gap-3 px-3 py-3 sm:px-4 transition-colors hover:bg-elevated text-left"
      >
        {/* Cycle badge */}
        <span className="flex shrink-0 items-center gap-1.5 rounded-md bg-zinc-800/60 px-2 py-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          <span
            className="text-[10px] font-semibold uppercase tracking-wide text-zinc-300"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Cycle
          </span>
        </span>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <p
            className="text-sm text-zinc-300 line-clamp-1 flex-1"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {latest.summary}
          </p>
          {totalTools > 0 && (
            <span
              className="shrink-0 rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-zinc-400"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {totalTools} tool{totalTools > 1 ? "s" : ""}
            </span>
          )}
          {totalTx > 0 && (
            <span
              className="shrink-0 rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-zinc-400"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {totalTx} tx
            </span>
          )}
          <span className="flex items-center gap-1">
            {phases.map((p) => (
              <span
                key={p}
                className={`h-1.5 w-1.5 rounded-full ${phaseDotClass[p] ?? "bg-zinc-500"}`}
                title={p}
              />
            ))}
          </span>
          <svg
            className={`h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <span className="shrink-0 text-xs text-zinc-500">{relativeTime(latest.timestamp)}</span>
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
