import { AlephHttpClient } from "@aleph-sdk/client";

const CHANNEL = "basileus";

export interface ToolExecution {
  name: string;
  args?: Record<string, string>;
  result?: string;
  txHash?: string;
  meta?: Record<string, string>;
}

export interface AlephActivityContent {
  summary: string;
  model: string;
  cycleId: string;
  tools?: ToolExecution[];
  txHashes?: string[];
}

export type ActivityType = "inventory" | "survival" | "strategy" | "error";

export interface AgentActivity {
  id: string;
  timestamp: string;
  type: ActivityType;
  model: string;
  summary: string;
  cycleId: string;
  tools?: ToolExecution[];
  txHashes?: string[];
}

const client = new AlephHttpClient();

export async function fetchActivities(address: string): Promise<AgentActivity[]> {
  const res = await client.getPosts<AlephActivityContent>({
    types: ["inventory", "survival", "strategy", "error"],
    channels: [CHANNEL],
    addresses: [address],
    pagination: 50,
    page: 1,
  });

  return res.posts.map((post) => ({
    id: post.item_hash,
    timestamp: new Date(post.time * 1000).toISOString(),
    type: post.original_type as ActivityType,
    model: post.content.model,
    summary: post.content.summary,
    cycleId: post.content.cycleId,
    tools: post.content.tools,
    txHashes: post.content.txHashes,
  }));
}
