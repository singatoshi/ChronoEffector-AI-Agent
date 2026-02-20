import { useInfiniteQuery } from "@tanstack/react-query";
import { blockscoutNextPage, getTransactions } from "../lib/blockscout";

export function useTransactions(address: string | undefined) {
  return useInfiniteQuery({
    queryKey: ["transactions", address],
    queryFn: async ({ pageParam }) => {
      if (!address) throw new Error("No address");
      return getTransactions(address, pageParam ?? undefined);
    },
    getNextPageParam: blockscoutNextPage,
    initialPageParam: null as Record<string, string> | null,
    enabled: !!address,
    staleTime: 35_000,
    refetchInterval: 30_000,
  });
}
