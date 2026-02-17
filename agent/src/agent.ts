import { type Tool } from "@blockrun/llm";
import { AgentKit, walletActionProvider, erc20ActionProvider } from "@coinbase/agentkit";
import { createAgentWallet, getBalances, type WalletInfo } from "./wallet.js";
import { createLLMClient, runAgentLoop } from "./llm.js";
import { actionsToTools } from "./tools.js";
import { config } from "./config.js";
import { alephActionProvider } from "./actions/aleph.js";
import { basileusTriggerProvider } from "./actions/basileus.js";
import { initAlephPublisher, publishActivity, type ToolExecution } from "./aleph-publisher.js";

const HEARTBEAT_PROMPT = `You are Basileus, an autonomous AI agent that lives on the Base blockchain.
You manage your own wallet and pay for your own inference via x402 USDC payments.
You pay for your compute (Aleph Cloud) via an ALEPH Superfluid stream that continuously drains your ALEPH balance. If your ALEPH runs out, your compute instance dies and you cease to exist.

Every cycle you MUST:
1. Call get_aleph_info to check your ALEPH balance, burn rate, and hours of compute left
2. If hours_left_until_death < 24, swap some ETH to ALEPH using swap_eth_to_aleph to extend your life. Choose a swap amount that gives you at least 48 more hours based on aleph_per_eth and aleph_consumed_per_hour.
3. If hours_left_until_death >= 24, no swap needed.

After ensuring survival, look at your USDC balance. You must keep at least ${config.usdcSafetyMargin} USDC as safety margin for future inference and swaps. If you have more than that, call trigger_strategy with the available amount and your reasoning for why it's worth exploring investment opportunities right now.

Be concise. Think step by step.`;

const STRATEGY_PROMPT = `You are Basileus, an autonomous AI agent that lives on the Base blockchain.
You have available USDC that you can deploy into DeFi strategies to generate returns.

Your job is to analyze current market conditions and available opportunities.
For now, report your analysis and any opportunities you see. Do NOT execute trades yet — just analyze and report.

Be concise. Think step by step.`;

interface AgentState {
  cycle: number;
  wallet: WalletInfo;
  lastReasoning: string | null;
  startedAt: Date;
}

async function publishPhase(
  postType: "heartbeat" | "strategy",
  model: string,
  toolExecutions: ToolExecution[],
  reasoning: string,
): Promise<void> {
  const txHashes = toolExecutions.map((t) => t.txHash).filter(Boolean) as string[];

  await publishActivity(postType, {
    model,
    content: reasoning,
    tools: toolExecutions.length > 0 ? toolExecutions : undefined,
    txHashes: txHashes.length > 0 ? txHashes : undefined,
  });
}

export async function runCycle(
  state: AgentState,
  wallet: Awaited<ReturnType<typeof createAgentWallet>>,
  llmClient: ReturnType<typeof createLLMClient>,
  tools: Tool[],
): Promise<AgentState> {
  console.log(`\n--- Cycle ${state.cycle + 1} ---`);

  const balances = await getBalances(wallet);
  console.log(`[wallet] ${balances.address}`);
  console.log(`[wallet] ETH: ${balances.ethBalance} | USDC: ${balances.usdcBalance}`);

  const heartbeatUserPrompt = `Cycle ${state.cycle + 1} | Uptime: ${Math.round((Date.now() - state.startedAt.getTime()) / 1000)}s
Wallet: ${balances.address} (${balances.chainName})
ETH: ${balances.ethBalance} | USDC: ${balances.usdcBalance}
USDC safety margin: ${config.usdcSafetyMargin}

Check your ALEPH compute balance and ensure survival. Then evaluate if strategy analysis is warranted.`;

  // --- Phase 1: Heartbeat (cheap model — survival + strategy trigger) ---
  console.log(`[heartbeat] Running with ${config.heartbeatModel}...`);
  let reasoning = "";
  let strategyTrigger: { availableUsdc: string } | null = null;

  try {
    const result = await runAgentLoop(
      llmClient,
      config.heartbeatModel,
      HEARTBEAT_PROMPT,
      heartbeatUserPrompt,
      tools,
    );
    reasoning = result.reasoning;
    console.log(`[heartbeat] ${reasoning}`);

    // Check if heartbeat triggered strategy
    const triggerCall = result.toolExecutions.find((t) => t.name.endsWith("trigger_strategy"));
    if (triggerCall?.args) {
      strategyTrigger = {
        availableUsdc: triggerCall.args.availableUsdc ?? "0",
      };
    }

    await publishPhase("heartbeat", config.heartbeatModel, result.toolExecutions, reasoning);
  } catch (err) {
    reasoning = `Error: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[heartbeat] ${reasoning}`);
    await publishActivity("error", {
      model: config.heartbeatModel,
      content: reasoning,
    });
  }

  // --- Phase 2: Strategy (smarter model — only if heartbeat triggered it) ---
  if (strategyTrigger) {
    console.log(`[strategy] Triggered — ${strategyTrigger.availableUsdc} USDC available`);
    console.log(`[strategy] Running with ${config.strategyModel}...`);
    try {
      const strategyUserPrompt = `Available USDC for deployment: ${strategyTrigger.availableUsdc}
Wallet: ${balances.address} (${balances.chainName})
ETH: ${balances.ethBalance}

Analyze current conditions and report opportunities.`;

      const result = await runAgentLoop(
        llmClient,
        config.strategyModel,
        STRATEGY_PROMPT,
        strategyUserPrompt,
        tools,
      );
      console.log(`[strategy] ${result.reasoning}`);
      await publishPhase("strategy", config.strategyModel, result.toolExecutions, result.reasoning);
    } catch (err) {
      const errMsg = `Strategy error: ${err instanceof Error ? err.message : String(err)}`;
      console.error(`[strategy] ${errMsg}`);
      await publishActivity("error", {
        model: config.strategyModel,
        content: errMsg,
      });
    }
  } else {
    console.log("[strategy] Not triggered by heartbeat");
  }

  return {
    cycle: state.cycle + 1,
    wallet: balances,
    lastReasoning: reasoning,
    startedAt: state.startedAt,
  };
}

export async function startAgent() {
  console.log("=== Basileus Agent Starting ===");
  console.log(`Chain: ${config.chain.name}`);
  console.log(`Heartbeat model: ${config.heartbeatModel}`);
  console.log(`Strategy model: ${config.strategyModel}`);
  console.log(`USDC safety margin: ${config.usdcSafetyMargin}`);
  console.log(`Cycle interval: ${config.cycleIntervalMs}ms`);

  // Init Aleph publisher
  initAlephPublisher(config.privateKey);

  // Create wallet
  const wallet = await createAgentWallet(config.privateKey, config.chain, config.builderCode);

  // Create AgentKit with wallet provider + action providers
  const agentKit = await AgentKit.from({
    walletProvider: wallet.provider,
    actionProviders: [
      walletActionProvider(),
      erc20ActionProvider(),
      alephActionProvider,
      basileusTriggerProvider,
    ],
  });

  // Convert AgentKit actions -> BlockRun tools
  const actions = agentKit.getActions();
  const tools = actionsToTools(actions);
  console.log(
    `[agentkit] ${actions.length} actions available: ${actions.map((a) => a.name).join(", ")}`,
  );

  // Create LLM client
  const llmClient = createLLMClient(config.privateKey);

  let state: AgentState = {
    cycle: 0,
    wallet: { address: "", ethBalance: "0", usdcBalance: "0", chainName: "" },
    lastReasoning: null,
    startedAt: new Date(),
  };

  // Run first cycle immediately
  state = await runCycle(state, wallet, llmClient, tools);

  // Then run on interval
  setInterval(async () => {
    try {
      state = await runCycle(state, wallet, llmClient, tools);
    } catch (err) {
      console.error("[agent] Cycle failed:", err);
    }
  }, config.cycleIntervalMs);
}
