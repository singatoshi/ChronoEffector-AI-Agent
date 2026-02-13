import { useQuery } from "@tanstack/react-query";
import { formatEther, formatUnits } from "viem";
import { publicClient } from "../lib/viem";
import { USDC, ALEPH, erc20BalanceAbi, USDC_DECIMALS, ALEPH_DECIMALS } from "../lib/contracts";

export interface AgentBalances {
  eth: string;
  usdc: string;
  aleph: string;
  alephRaw: bigint;
}

export function useAgentBalance(address: `0x${string}` | undefined) {
  return useQuery({
    queryKey: ["balance", address],
    queryFn: async (): Promise<AgentBalances> => {
      if (!address) throw new Error("No address");
      const [ethBal, usdcBal, alephBal] = await Promise.all([
        publicClient.getBalance({ address }),
        publicClient.readContract({
          address: USDC, abi: erc20BalanceAbi,
          functionName: "balanceOf", args: [address],
        }),
        publicClient.readContract({
          address: ALEPH, abi: erc20BalanceAbi,
          functionName: "balanceOf", args: [address],
        }),
      ]);
      return {
        eth: formatEther(ethBal),
        usdc: formatUnits(usdcBal, USDC_DECIMALS),
        aleph: formatUnits(alephBal, ALEPH_DECIMALS),
        alephRaw: alephBal,
      };
    },
    enabled: !!address,
    refetchInterval: 30_000,
  });
}
