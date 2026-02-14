import { useEffect, useMemo, useRef, useState } from "react";
import type { AgentActivity } from "../../hooks/useActivities";
import { useActivities } from "../../hooks/useActivities";
import { useTokenTransfers } from "../../hooks/useTokenTransfers";
import { useTransactions } from "../../hooks/useTransactions";
import type { BlockscoutTokenTransferItem, BlockscoutTx } from "../../lib/blockscout";
import { ActivityRow } from "./ActivityRow";
import { FeedFilters, type FilterValue } from "./FeedFilters";
import { TokenTransferRow } from "./TokenTransferRow";
import { TransactionRow, TransactionRowSkeleton } from "./TransactionRow";

type FeedItem =
  | { kind: "tx"; timestamp: number; data: BlockscoutTx }
  | { kind: "token_transfer"; timestamp: number; data: BlockscoutTokenTransferItem }
  | { kind: "activity"; timestamp: number; data: AgentActivity };

interface ActivityFeedProps {
  address: string;
}

function isScamTransfer(tt: BlockscoutTokenTransferItem): boolean {
  return tt.method?.toLowerCase() === "airdrop";
}

function FiltersButton({
  hideScams,
  onHideScamsChange,
}: {
  hideScams: boolean;
  onHideScamsChange: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const activeCount = [hideScams].filter(Boolean).length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
          open
            ? "bg-neutral-800 text-zinc-50"
            : "bg-elevated text-zinc-400 hover:text-zinc-300"
        }`}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
        {activeCount > 0 && (
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-50" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-1.5 w-56 rounded-xl border border-neutral-800 bg-neutral-900 p-3 shadow-xl">
          <p className="mb-2 text-xs font-medium text-zinc-300">Filters</p>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-elevated select-none">
            <input
              type="checkbox"
              checked={hideScams}
              onChange={(e) => onHideScamsChange(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-zinc-600 bg-neutral-800 accent-zinc-400"
            />
            Hide scam transactions
          </label>
        </div>
      )}
    </div>
  );
}

export function ActivityFeed({ address }: ActivityFeedProps) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [hideScams, setHideScams] = useState(true);

  const txQuery = useTransactions(address);
  const tokenQuery = useTokenTransfers(address);
  const actQuery = useActivities(address);

  const allTxs = useMemo(() => txQuery.data?.pages.flatMap((p) => p.items) ?? [], [txQuery.data]);

  const allTokenTransfers = useMemo(
    () => tokenQuery.data?.pages.flatMap((p) => p.items) ?? [],
    [tokenQuery.data],
  );

  const activities = useMemo(() => actQuery.data ?? [], [actQuery.data]);

  // Collect tx hashes from regular txs so we can deduplicate token transfers
  const txHashes = useMemo(() => new Set(allTxs.map((tx) => tx.hash.toLowerCase())), [allTxs]);

  // Merge + sort
  const feedItems = useMemo(() => {
    const items: FeedItem[] = [];

    if (filter !== "activities") {
      for (const tx of allTxs) {
        items.push({
          kind: "tx",
          timestamp: new Date(tx.timestamp).getTime(),
          data: tx,
        });
      }
      // Only add token transfers whose tx hash isn't already shown as a regular tx
      for (const tt of allTokenTransfers) {
        if (txHashes.has(tt.transaction_hash.toLowerCase())) continue;
        if (hideScams && isScamTransfer(tt)) continue;
        items.push({
          kind: "token_transfer",
          timestamp: new Date(tt.timestamp).getTime(),
          data: tt,
        });
      }
    }

    if (filter !== "transactions") {
      for (const act of activities) {
        items.push({
          kind: "activity",
          timestamp: new Date(act.timestamp).getTime(),
          data: act,
        });
      }
    }

    items.sort((a, b) => b.timestamp - a.timestamp);
    return items;
  }, [allTxs, allTokenTransfers, txHashes, activities, filter, hideScams]);

  const nothingYet = txQuery.isLoading && tokenQuery.isLoading && actQuery.isLoading;
  const stillLoading = txQuery.isLoading || tokenQuery.isLoading || actQuery.isLoading;

  return (
    <section>
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2
          className="text-xl font-bold tracking-tight text-zinc-50"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Activity
        </h2>
        <div className="flex items-center gap-2">
          <FeedFilters activeFilter={filter} onFilterChange={setFilter} />
          <FiltersButton hideScams={hideScams} onHideScamsChange={setHideScams} />
        </div>
      </div>

      {/* Feed */}
      <div className="overflow-hidden rounded-xl border border-neutral-800 bg-surface">
        {nothingYet ? (
          <div>
            {Array.from({ length: 5 }).map((_, i) => (
              <TransactionRowSkeleton key={i} />
            ))}
          </div>
        ) : feedItems.length === 0 && !stillLoading ? (
          <div className="py-12 text-center text-sm text-zinc-500">No activity yet</div>
        ) : (
          <div>
            {feedItems.map((item) =>
              item.kind === "tx" ? (
                <TransactionRow
                  key={`tx-${item.data.hash}`}
                  tx={item.data}
                  agentAddress={address}
                />
              ) : item.kind === "token_transfer" ? (
                <TokenTransferRow
                  key={`tt-${item.data.transaction_hash}-${item.data.log_index}`}
                  transfer={item.data}
                  agentAddress={address}
                />
              ) : (
                <ActivityRow key={`act-${item.data.id}`} activity={item.data} />
              ),
            )}
            {stillLoading && (
              <>
                <TransactionRowSkeleton />
                <TransactionRowSkeleton />
              </>
            )}
          </div>
        )}

        {/* Load more */}
        {(txQuery.hasNextPage || tokenQuery.hasNextPage) && (
          <div className="border-t border-subtle px-4 py-3 text-center">
            <button
              type="button"
              onClick={() => {
                if (txQuery.hasNextPage) txQuery.fetchNextPage();
                if (tokenQuery.hasNextPage) tokenQuery.fetchNextPage();
              }}
              disabled={txQuery.isFetchingNextPage || tokenQuery.isFetchingNextPage}
              className="text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-50 disabled:opacity-50"
            >
              {txQuery.isFetchingNextPage || tokenQuery.isFetchingNextPage
                ? "Loading..."
                : "Load more"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
