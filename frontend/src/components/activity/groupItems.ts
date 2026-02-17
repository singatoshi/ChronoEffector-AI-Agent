import type { AgentActivity } from "../../hooks/useActivities";
import type { NormalizedTxItem } from "./normalize";

export type DisplayItem =
  | { kind: "single"; item: NormalizedTxItem }
  | { kind: "group"; items: NormalizedTxItem[] }
  | { kind: "activity"; data: AgentActivity }
  | { kind: "activityGroup"; activities: AgentActivity[] };

type MergedEntry = { sort: number; groupKey: string; di: DisplayItem };

export function groupFeedItems(
  txItems: NormalizedTxItem[],
  activities: AgentActivity[],
  filter: "all" | "transactions" | "activities",
): DisplayItem[] {
  const merged: MergedEntry[] = [];

  if (filter !== "activities") {
    for (const item of txItems) {
      merged.push({ sort: item.timestamp, groupKey: item.groupKey, di: { kind: "single", item } });
    }
  }

  if (filter !== "transactions") {
    for (const act of activities) {
      merged.push({
        sort: new Date(act.timestamp).getTime(),
        groupKey: `act-${act.type}`,
        di: { kind: "activity", data: act },
      });
    }
  }

  merged.sort((a, b) => b.sort - a.sort);

  // Group adjacent items with matching groupKey
  const result: { groupKey: string; di: DisplayItem }[] = [];
  for (const { groupKey, di } of merged) {
    const prev = result[result.length - 1];
    if (!prev || prev.groupKey !== groupKey) {
      result.push({ groupKey, di });
      continue;
    }
    // Merge tx items
    if (di.kind === "single" && prev.di.kind === "single") {
      prev.di = { kind: "group", items: [prev.di.item, di.item] };
    } else if (di.kind === "single" && prev.di.kind === "group") {
      prev.di.items.push(di.item);
      // Merge activity items
    } else if (di.kind === "activity" && prev.di.kind === "activity") {
      prev.di = { kind: "activityGroup", activities: [prev.di.data, di.data] };
    } else if (di.kind === "activity" && prev.di.kind === "activityGroup") {
      prev.di.activities.push(di.data);
    } else {
      result.push({ groupKey, di });
    }
  }

  return result.map((r) => r.di);
}
