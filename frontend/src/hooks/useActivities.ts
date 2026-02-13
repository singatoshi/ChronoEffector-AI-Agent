import { useQuery } from "@tanstack/react-query";

export interface AgentActivity {
  id: string;
  timestamp: string;
  type: "cycle" | "tool_call" | "reasoning";
  content: string;
  txHash?: string;
}

export function useActivities(_address: string | undefined) {
  return useQuery({
    queryKey: ["activities", _address],
    queryFn: async (): Promise<AgentActivity[]> => {
      // TODO: Replace with Aleph API query
      return [
        {
          id: "1",
          timestamp: new Date().toISOString(),
          type: "cycle",
          content: "Cycle 42: Checked balances, ALEPH buffer healthy (312h remaining)",
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 60000).toISOString(),
          type: "tool_call",
          content: "Called get_aleph_info — balance: 156.2 ALEPH, burn: 0.5/hr",
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 120000).toISOString(),
          type: "tool_call",
          content: "Called swap_eth_to_aleph(0.01 ETH) → 12.34 ALEPH",
          txHash: "0xabc123def456",
        },
      ];
    },
    enabled: !!_address,
    staleTime: Infinity,
  });
}
