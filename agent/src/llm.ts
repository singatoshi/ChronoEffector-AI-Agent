import { LLMClient, type ChatMessage, type Tool } from "@blockrun/llm";
import { type Hex } from "viem";
import { executeTool } from "./tools.js";
import type { ToolExecution } from "./aleph-publisher.js";

const MAX_TOOL_ROUNDS = 10;

export interface AgentLoopResult {
  reasoning: string;
  toolExecutions: ToolExecution[];
}

export function createLLMClient(privateKey: Hex) {
  return new LLMClient({ privateKey });
}

export async function runAgentLoop(
  client: LLMClient,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  tools: Tool[],
): Promise<AgentLoopResult> {
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const toolExecutions: ToolExecution[] = [];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const result = await client.chatCompletion(model, messages, {
      tools: tools.length > 0 ? tools : undefined,
      toolChoice: tools.length > 0 ? "auto" : undefined,
    });

    const choice = result.choices[0];
    const msg = choice.message;

    messages.push({
      role: "assistant",
      content: msg.content ?? null,
      tool_calls: msg.tool_calls,
    });

    if (choice.finish_reason !== "tool_calls" || !msg.tool_calls?.length) {
      return { reasoning: msg.content ?? "", toolExecutions };
    }

    for (const toolCall of msg.tool_calls) {
      const { name, arguments: argsJson } = toolCall.function;
      console.log(`[tool] calling ${name}(${argsJson})`);

      const toolResult = await executeTool(name, argsJson);
      console.log(`[tool] ${name} -> ${toolResult.slice(0, 200)}`);

      let args: Record<string, string> | undefined;
      try {
        args = JSON.parse(argsJson);
      } catch {
        args = undefined;
      }

      const txMatch = toolResult.match(/[Hh]ash:?\s*(0x[a-fA-F0-9]{64})/);
      const txHash = txMatch?.[1];

      toolExecutions.push({
        name,
        args,
        result: toolResult,
        txHash,
      });

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: toolResult,
      });
    }
  }

  console.log("[llm] max tool rounds reached, getting final response");
  const final = await client.chatCompletion(model, messages);
  return { reasoning: final.choices[0].message.content ?? "", toolExecutions };
}
