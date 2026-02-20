import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

export const publicClient = createPublicClient({
  chain: base,
  transport: http(import.meta.env.VITE_RPC_URL ?? "https://mainnet.base.org"),
});
