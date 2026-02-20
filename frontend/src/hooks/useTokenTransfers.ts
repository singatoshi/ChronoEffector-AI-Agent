import { useInfiniteQuery } from "@tanstack/react-query";
import { blockscoutNextPage, getTokenTransfers } from "../lib/blockscout";

export function useTokenTransfers(address: string | undefined) {
  return useInfiniteQuery({
    queryKey: ["tokenTransfers", address],
    queryFn: async ({ pageParam }) => {
      if (!address) throw new Error("No address");
      return getTokenTransfers(address, pageParam ?? undefined);
    },
    getNextPageParam: blockscoutNextPage,
    initialPageParam: null as Record<string, string> | null,
    enabled: !!address,
    staleTime: 35_000,
    refetchInterval: 30_000,
  });
}
