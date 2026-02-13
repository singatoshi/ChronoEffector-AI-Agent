import { useQuery } from "@tanstack/react-query";
import { getOutflows, type SuperfluidStream } from "../lib/superfluid";
import { useState, useEffect, useRef, useCallback } from "react";
import { formatUnits } from "viem";

export interface StreamInfo {
  totalFlowRatePerSec: bigint;
  flowRatePerHour: number;
  streams: SuperfluidStream[];
}

export function useSuperfluidStreams(address: `0x${string}` | undefined) {
  return useQuery({
    queryKey: ["superfluid", address],
    queryFn: async (): Promise<StreamInfo> => {
      if (!address) throw new Error("No address");
      const streams = await getOutflows(address);
      const alephStreams = streams.filter((s) => s.token.symbol.toLowerCase().includes("aleph"));
      const totalFlowRate = alephStreams.reduce((sum, s) => sum + BigInt(s.currentFlowRate), 0n);
      return {
        totalFlowRatePerSec: totalFlowRate,
        flowRatePerHour: parseFloat(formatUnits(totalFlowRate * 3600n, 18)),
        streams: alephStreams,
      };
    },
    enabled: !!address,
    refetchInterval: 30_000,
  });
}

/**
 * Live-ticking ALEPH balance using requestAnimationFrame.
 * Takes a snapshot balance + flow rate and ticks down client-side.
 */
export function useLiveAlephBalance(
  snapshotBalance: bigint | undefined,
  flowRatePerSec: bigint | undefined,
): string {
  const [display, setDisplay] = useState("0");
  const startTimeRef = useRef<number>(0);
  const startBalRef = useRef<bigint>(0n);
  const rateRef = useRef<bigint>(0n);
  const rafRef = useRef<number>(0);

  // Reset when snapshot changes
  useEffect(() => {
    if (snapshotBalance === undefined || flowRatePerSec === undefined) return;
    startBalRef.current = snapshotBalance;
    rateRef.current = flowRatePerSec;
    startTimeRef.current = performance.now();
  }, [snapshotBalance, flowRatePerSec]);

  const tick = useCallback(() => {
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const drained = rateRef.current * BigInt(Math.floor(elapsed));
    const current = startBalRef.current - drained;
    setDisplay(formatUnits(current > 0n ? current : 0n, 18));
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (snapshotBalance === undefined || flowRatePerSec === undefined) return;
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [snapshotBalance, flowRatePerSec, tick]);

  return display;
}
