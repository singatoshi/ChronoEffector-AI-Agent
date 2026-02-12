import { z } from "zod";
import { customActionProvider, EvmWalletProvider } from "@coinbase/agentkit";
import { createPublicClient, formatUnits, http, parseEther, encodeFunctionData } from "viem";
import { base } from "viem/chains";
import {
  ALEPH_ADDRESS,
  WETH_ADDRESS,
  UNISWAP_ROUTER,
  UNISWAP_ALEPH_POOL,
  SUPERFLUID_SUBGRAPH_URL,
  uniswapV3PoolAbi,
  uniswapRouterAbi,
} from "./aleph.js";

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

const SUPERFLUID_BALANCE_QUERY = `
  query accountTokenSnapshots($where: AccountTokenSnapshot_filter = {}) {
    accountTokenSnapshots(where: $where) {
      balanceUntilUpdatedAt
      totalOutflowRate
    }
  }
`;

async function getAlephInfo(walletProvider: EvmWalletProvider): Promise<string> {
  try {
    const address = walletProvider.getAddress().toLowerCase();

    // 1. Query Superfluid subgraph for ALEPH balance + outflow
    const sfResponse = await fetch(SUPERFLUID_SUBGRAPH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: SUPERFLUID_BALANCE_QUERY,
        variables: {
          where: {
            account: address,
            token: ALEPH_ADDRESS.toLowerCase(),
          },
        },
      }),
    });

    if (!sfResponse.ok) {
      return `Error: Superfluid subgraph returned ${sfResponse.status}`;
    }

    const sfData = await sfResponse.json();
    const snapshots = sfData?.data?.accountTokenSnapshots;

    let alephBalance = 0;
    let alephPerHour = 0;
    let hoursLeft = 1000000;

    if (snapshots && snapshots.length > 0) {
      const rawBalance = BigInt(snapshots[0].balanceUntilUpdatedAt);
      const rawOutflow = BigInt(snapshots[0].totalOutflowRate);

      alephBalance = parseFloat(formatUnits(rawBalance, 18));
      // outflow is per-second, convert to per-hour
      alephPerHour = parseFloat(formatUnits(rawOutflow * 3600n, 18));

      if (alephPerHour > 0) {
        hoursLeft = Math.round(alephBalance / alephPerHour);
      }
    }

    // 2. ETH balance
    const ethBalanceWei = await publicClient.getBalance({
      address: walletProvider.getAddress() as `0x${string}`,
    });
    const ethBalance = parseFloat(formatUnits(ethBalanceWei, 18));

    // 3. Uniswap V3 pool price (ALEPH per ETH)
    const slot0 = await publicClient.readContract({
      address: UNISWAP_ALEPH_POOL,
      abi: uniswapV3PoolAbi,
      functionName: "slot0",
    });
    const sqrtPriceX96 = slot0[0];
    // price = (sqrtPriceX96 / 2^96)^2
    const price = Number(sqrtPriceX96) / 2 ** 96;
    const alephPerEth = price * price;

    return JSON.stringify({
      aleph_balance: Math.round(alephBalance * 1000) / 1000,
      aleph_consumed_per_hour: Math.round(alephPerHour * 1000) / 1000,
      hours_left_until_death: hoursLeft,
      eth_balance: Math.round(ethBalance * 10000) / 10000,
      aleph_per_eth: Math.round(alephPerEth * 100) / 100,
    });
  } catch (err) {
    return `Error getting ALEPH info: ${err instanceof Error ? err.message : String(err)}`;
  }
}

export const alephActionProvider = customActionProvider<EvmWalletProvider>([
  {
    name: "get_aleph_info",
    description:
      "Get your current ALEPH balance, hourly consumption rate, estimated hours of compute left, ETH balance, and ALEPH/ETH price. Use this to decide whether you need to buy more ALEPH.",
    schema: z.object({}),
    invoke: async (walletProvider: EvmWalletProvider, _args: unknown) => {
      return getAlephInfo(walletProvider);
    },
  },
  {
    name: "swap_eth_to_aleph",
    description:
      "Swap ETH to ALEPH via Uniswap V3 to pay for your computing. Provide the amount of ETH to swap.",
    schema: z.object({
      ethAmount: z.string().describe("Amount of ETH to swap, e.g. '0.01'"),
    }),
    invoke: async (walletProvider: EvmWalletProvider, args: { ethAmount: string }) => {
      try {
        const amountInWei = parseEther(args.ethAmount);
        const address = walletProvider.getAddress() as `0x${string}`;

        const data = encodeFunctionData({
          abi: uniswapRouterAbi,
          functionName: "exactInputSingle",
          args: [
            {
              tokenIn: WETH_ADDRESS,
              tokenOut: ALEPH_ADDRESS,
              fee: 10000,
              recipient: address,
              amountIn: amountInWei,
              amountOutMinimum: 0n,
              sqrtPriceLimitX96: 0n,
            },
          ],
        });

        const txHash = await walletProvider.sendTransaction({
          to: UNISWAP_ROUTER,
          data,
          value: amountInWei,
        });

        return `Swap transaction sent. Hash: ${txHash}`;
      } catch (err) {
        return `Error swapping ETH to ALEPH: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
  },
]);
