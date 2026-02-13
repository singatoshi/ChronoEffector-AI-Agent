import { Card } from "@/components/ui/card";
import type { ReactNode } from "react";

interface BalanceCardProps {
  label: string;
  value: string;
  accentColor: string;
  icon?: ReactNode;
  index?: number;
}

export function BalanceCard({
  label,
  value,
  accentColor,
  icon,
  index = 0,
}: BalanceCardProps) {
  // Truncate to 6 decimals for readability
  const parts = value.split(".");
  const display =
    parts.length === 2 ? `${parts[0]}.${parts[1].slice(0, 6)}` : value;

  return (
    <Card
      className="animate-card-reveal relative overflow-hidden border-[#262626] bg-[#141414] py-5"
      style={{
        animationDelay: `${(index + 1) * 80}ms`,
        borderLeftWidth: 4,
        borderLeftColor: accentColor,
      }}
    >
      <div className="px-5">
        <div className="flex items-center gap-2">
          {icon && <span className="text-base">{icon}</span>}
          <span
            className="text-[11px] uppercase tracking-widest text-[#a1a1aa]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {label}
          </span>
        </div>

        <p
          className="mt-3 truncate text-2xl font-medium text-[#fafafa]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {display}
        </p>
      </div>
    </Card>
  );
}

export function BalanceCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <Card
      className="animate-card-reveal border-[#262626] bg-[#141414] py-5"
      style={{ animationDelay: `${(index + 1) * 80}ms` }}
    >
      <div className="px-5">
        <div className="h-3.5 w-12 animate-skeleton-pulse rounded bg-[#262626]" />
        <div className="mt-3 h-7 w-32 animate-skeleton-pulse rounded bg-[#262626]" />
      </div>
    </Card>
  );
}
