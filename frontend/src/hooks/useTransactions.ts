import { useInfiniteQuery } from "@tanstack/react-query";
import { getTransactions } from "../lib/blockscout";

export function useTransactions(address: string | undefined) {
  return useInfiniteQuery({
    queryKey: ["transactions", address],
    queryFn: async ({ pageParam }) => {
      if (!address) throw new Error("No address");
      return getTransactions(address, pageParam ?? undefined);
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.next_page_params) return undefined;
      const params: Record<string, string> = {};
      for (const [k, v] of Object.entries(lastPage.next_page_params)) {
        params[k] = String(v);
      }
      return params;
    },
    initialPageParam: null as Record<string, string> | null,
    enabled: !!address,
    refetchInterval: 30_000,
  });
}
