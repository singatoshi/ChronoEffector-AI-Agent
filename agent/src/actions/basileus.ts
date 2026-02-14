import { z } from "zod";
import { customActionProvider, EvmWalletProvider } from "@coinbase/agentkit";

export const basileusTriggerProvider = customActionProvider<EvmWalletProvider>([
  {
    name: "trigger_strategy",
    description:
      "Call this when there is USDC available beyond the safety margin and you think it is worth analyzing investment opportunities. This will trigger a deeper strategy analysis with a smarter model.",
    schema: z.object({
      availableUsdc: z
        .string()
        .describe("Amount of USDC available for deployment (after safety margin)"),
      reason: z
        .string()
        .describe(
          "Why you think it is worth running strategy analysis right now (e.g. market conditions, balance size, etc.)",
        ),
    }),
    invoke: async (
      _walletProvider: EvmWalletProvider,
      args: { availableUsdc: string; reason: string },
    ) => {
      return JSON.stringify({
        triggered: true,
        availableUsdc: args.availableUsdc,
        reason: args.reason,
      });
    },
  },
]);
