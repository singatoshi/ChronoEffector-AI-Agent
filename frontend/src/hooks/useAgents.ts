import { useQuery } from "@tanstack/react-query";
import { publicClient } from "../lib/viem";
import { L2_REGISTRAR, l2RegistrarAbi, L2_REGISTRAR_DEPLOY_BLOCK } from "../lib/contracts";

export interface Agent {
  label: string;
  owner: `0x${string}`;
}

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: async (): Promise<Agent[]> => {
      // Get all NameRegistered events (owner is indexed address, readable)
      const logs = await publicClient.getLogs({
        address: L2_REGISTRAR,
        event: {
          type: "event",
          name: "NameRegistered",
          inputs: [
            { name: "label", type: "string", indexed: true },
            { name: "owner", type: "address", indexed: true },
          ],
        },
        fromBlock: L2_REGISTRAR_DEPLOY_BLOCK,
        toBlock: "latest",
      });

      // Get unique owners from events
      const owners = [...new Set(logs.map((l) => l.args.owner!))];

      // Batch reverseNames calls to get actual labels (indexed string = keccak hash)
      const results = await Promise.all(
        owners.map(async (owner) => {
          const label = await publicClient.readContract({
            address: L2_REGISTRAR,
            abi: l2RegistrarAbi,
            functionName: "reverseNames",
            args: [owner],
          });
          return { label: label as string, owner };
        }),
      );

      return results.filter((r) => r.label);
    },
    staleTime: 60_000,
  });
}
