import { useQuery } from "@tanstack/react-query";
import { publicClient } from "../lib/viem";
import { UNISWAP_ALEPH_POOL, uniswapV3PoolAbi } from "../lib/contracts";

export function useAlephPrice() {
  return useQuery({
    queryKey: ["alephPrice"],
    queryFn: async () => {
      const slot0 = await publicClient.readContract({
        address: UNISWAP_ALEPH_POOL,
        abi: uniswapV3PoolAbi,
        functionName: "slot0",
      });
      const sqrtPriceX96 = slot0[0];
      const price = Number(sqrtPriceX96) / 2 ** 96;
      const alephPerEth = price * price;
      return { alephPerEth: Math.round(alephPerEth * 100) / 100 };
    },
    refetchInterval: 60_000,
  });
}
