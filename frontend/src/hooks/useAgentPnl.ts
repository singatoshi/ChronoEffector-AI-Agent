import { useQuery } from "@tanstack/react-query";
import { getTokenTransfers } from "../lib/blockscout";
import { BLOCKRUN_X402 } from "../lib/contracts";
import { useSuperfluidStreams } from "./useSuperfluid";
import { useAlephPrice } from "./useAlephPrice";

export interface PnlData {
  inferenceCostUsd: number;
  computingCostUsd: number;
  totalAlephStreamed: number;
  alephUsd: number;
  pnl: number;
}

function useInferenceCosts(address: `0x${string}` | undefined) {
  return useQuery({
    queryKey: ["inferenceCosts", address],
    queryFn: async () => {
      if (!address) throw new Error("No address");
      let total = 0;
      let params: Record<string, string> | undefined;
      // Paginate through all token transfers
      for (;;) {
        const page = await getTokenTransfers(address, params);
        for (const item of page.items) {
          if (item.to.hash.toLowerCase() === BLOCKRUN_X402.toLowerCase()) {
            const decimals = parseInt(item.total.decimals, 10);
            total += parseFloat(item.total.value) / 10 ** decimals;
          }
        }
        if (!page.next_page_params) break;
        params = {};
        for (const [k, v] of Object.entries(page.next_page_params)) {
          params[k] = String(v);
        }
      }
      return total;
    },
    enabled: !!address,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

export function useAgentPnl(address: `0x${string}` | undefined): {
  data: PnlData | undefined;
  isLoading: boolean;
} {
  const inference = useInferenceCosts(address);
  const streams = useSuperfluidStreams(address);
  const alephPrice = useAlephPrice();

  const isLoading = inference.isLoading || streams.isLoading || alephPrice.isLoading;

  if (isLoading || inference.data === undefined || !streams.data || !alephPrice.data) {
    return { data: undefined, isLoading };
  }

  const inferenceCostUsd = inference.data ?? 0;
  const totalAlephStreamed = streams.data.totalAlephStreamed;
  const alephUsd = alephPrice.data.alephUsd;
  const computingCostUsd = totalAlephStreamed * alephUsd;
  const pnl = -(inferenceCostUsd + computingCostUsd);

  return {
    data: { inferenceCostUsd, computingCostUsd, totalAlephStreamed, alephUsd, pnl },
    isLoading: false,
  };
}
