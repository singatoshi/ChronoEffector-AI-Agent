import { useQuery } from "@tanstack/react-query";

const STALE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

export function useBlockscoutFreshness() {
  return useQuery({
    queryKey: ["blockscout-freshness"],
    queryFn: async () => {
      const res = await fetch("https://base.blockscout.com/api/v2/main-page/blocks");
      const blocks: Array<{ timestamp: string }> = await res.json();
      if (!blocks.length) return { stale: true, ageMinutes: 0 };
      const ageMs = Date.now() - new Date(blocks[0].timestamp).getTime();
      return { stale: ageMs > STALE_THRESHOLD_MS, ageMinutes: Math.round(ageMs / 60_000) };
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}
