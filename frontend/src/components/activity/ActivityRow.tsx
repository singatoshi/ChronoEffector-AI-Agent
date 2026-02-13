import type { AgentActivity } from "../../hooks/useActivities";
import { relativeTime } from "../../lib/format";

interface ActivityRowProps {
  activity: AgentActivity;
}

const typeConfig: Record<AgentActivity["type"], { label: string; color: string; bg: string }> = {
  cycle: {
    label: "Cycle",
    color: "text-[#818cf8]",
    bg: "bg-[#818cf8]/10",
  },
  tool_call: {
    label: "Tool",
    color: "text-[#f59e0b]",
    bg: "bg-[#f59e0b]/10",
  },
  reasoning: {
    label: "Reason",
    color: "text-[#10b981]",
    bg: "bg-[#10b981]/10",
  },
};

export function ActivityRow({ activity }: ActivityRowProps) {
  const config = typeConfig[activity.type];

  return (
    <div className="group flex items-start gap-3 border-b border-[#1a1a1a] px-3 py-3 sm:px-4 transition-colors hover:bg-[#141414]">
      {/* Type badge */}
      <span
        className={`mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${config.color} ${config.bg}`}
      >
        {config.label}
      </span>

      {/* Content */}
      <p
        className="min-w-0 flex-1 text-sm leading-relaxed text-[#d4d4d8]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {activity.content}
      </p>

      {/* Timestamp */}
      <span className="shrink-0 text-xs text-[#71717a]">{relativeTime(activity.timestamp)}</span>

      {/* Tx link if present */}
      {activity.txHash && (
        <a
          href={`https://basescan.org/tx/${activity.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-[#52525b] transition-colors hover:text-[#a1a1aa]"
          title="View on Basescan"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      )}
    </div>
  );
}
