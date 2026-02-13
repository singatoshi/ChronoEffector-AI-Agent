import { Card } from "@/components/ui/card";
import { useLiveAlephBalance } from "../../hooks/useSuperfluid";

interface StreamCardProps {
  address: `0x${string}`;
  alephRaw: bigint | undefined;
  flowRatePerSec: bigint | undefined;
  flowRatePerHour: number;
  hoursLeft: number;
}

function hoursLeftLabel(h: number): { text: string; color: string } {
  if (!isFinite(h)) return { text: "Inactive", color: "#a1a1aa" };
  if (h <= 0) return { text: "Depleted", color: "#ef4444" };
  if (h < 2) return { text: `${Math.round(h * 60)}m remaining`, color: "#ef4444" };
  if (h < 24) return { text: `${Math.round(h)}h remaining`, color: "#eab308" };
  if (h < 48) return { text: `${Math.round(h)}h remaining`, color: "#22c55e" };
  return { text: `${Math.round(h / 24)}d remaining`, color: "#22c55e" };
}

export function StreamCard({
  address,
  alephRaw,
  flowRatePerSec,
  flowRatePerHour,
  hoursLeft,
}: StreamCardProps) {
  const liveBalance = useLiveAlephBalance(alephRaw, flowRatePerSec);

  // Format: keep up to 8 decimal places for the live-ticking display
  const parts = liveBalance.split(".");
  const intPart = parts[0];
  const decPart = parts.length === 2 ? parts[1].slice(0, 8).padEnd(8, "0") : "00000000";

  const hlInfo = hoursLeftLabel(hoursLeft);
  const rateDisplay =
    flowRatePerHour > 0
      ? flowRatePerHour < 0.01
        ? "< 0.01"
        : flowRatePerHour.toFixed(2)
      : "0";

  return (
    <Card
      className="animate-card-reveal relative col-span-1 overflow-hidden border-[#262626] bg-[#141414] py-6 lg:col-span-2"
      style={{ animationDelay: "0ms" }}
    >
      {/* Ambient amber glow at top */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #f59e0b40, transparent)" }}
      />

      <div className="px-6">
        {/* Label */}
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] uppercase tracking-widest text-[#a1a1aa]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            ALEPH Balance &bull; Streaming
          </span>
          <a
            href={`https://app.superfluid.org/?view=${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-[#52525b] transition-colors hover:text-[#a1a1aa]"
          >
            Superfluid
            <svg
              className="h-3 w-3"
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
        </div>

        {/* Live-ticking balance */}
        <p
          className="mt-4 text-3xl font-medium leading-none text-[#fafafa] md:text-4xl"
          style={{
            fontFamily: "var(--font-mono)",
            textShadow: "0 0 20px rgba(245, 158, 11, 0.3), 0 0 40px rgba(245, 158, 11, 0.1)",
          }}
        >
          <span>{intPart}</span>
          <span className="text-[#a1a1aa]">.</span>
          <span className="text-[#d4d4d8]">{decPart}</span>
        </p>

        {/* Flow rate + hours left */}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span
            className="flex items-center gap-1.5 text-sm text-[#a1a1aa]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span className="text-[#f59e0b]">&darr;</span>
            {rateDisplay} ALEPH/hr
          </span>

          <span
            className="text-sm font-medium"
            style={{ fontFamily: "var(--font-mono)", color: hlInfo.color }}
          >
            {hlInfo.text}
          </span>
        </div>
      </div>
    </Card>
  );
}

export function StreamCardSkeleton() {
  return (
    <Card
      className="animate-card-reveal border-[#262626] bg-[#141414] py-6 lg:col-span-2"
      style={{ animationDelay: "0ms" }}
    >
      <div className="px-6">
        <div className="h-3.5 w-40 animate-skeleton-pulse rounded bg-[#262626]" />
        <div className="mt-4 h-10 w-64 animate-skeleton-pulse rounded bg-[#262626]" />
        <div className="mt-4 flex gap-4">
          <div className="h-4 w-28 animate-skeleton-pulse rounded bg-[#262626]" />
          <div className="h-4 w-20 animate-skeleton-pulse rounded bg-[#262626]" />
        </div>
      </div>
    </Card>
  );
}
