// --- Addresses (Base mainnet) ---
export const L2_REGISTRAR = "0xBb3699a3018A8a82A94be194eCfe65512AD8E995" as const;
export const L2_REGISTRY = "0x2e84f843299a132103e110c948c5e4739682c961" as const;
export const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
export const ALEPH = "0xc0Fbc4967259786C743361a5885ef49380473dCF" as const;
export const UNISWAP_ALEPH_POOL = "0xe11C66b25F0e9a9eBEf1616B43424CC6E2168FC8" as const;
export const SUPERFLUID_CFAV1_FORWARDER = "0xcfA132E353cB4E398080B9700609bb008eceB125" as const;
export const BLOCKRUN_X402 = "0xe9030014F5DAe217d0A152f02A043567b16c1aBf" as const;
export const COMPOUND_COMET = "0xb125E6687d4313864e53df431d5425969c15Eb2F" as const;

// Block where L2Registrar was deployed
export const L2_REGISTRAR_DEPLOY_BLOCK = 42102582n;

// Token decimals
export const USDC_DECIMALS = 6;
export const ALEPH_DECIMALS = 18;

// --- ABIs ---

export const erc20BalanceAbi = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const l2RegistrarAbi = [
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "reverseNames",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "label", type: "string" }],
    name: "available",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    type: "event",
    name: "NameRegistered",
    inputs: [
      { name: "label", type: "string", indexed: true },
      { name: "owner", type: "address", indexed: true },
    ],
  },
] as const;

export const uniswapV3PoolAbi = [
  {
    inputs: [],
    name: "slot0",
    outputs: [
      { name: "sqrtPriceX96", type: "uint160" },
      { name: "tick", type: "int24" },
      { name: "observationIndex", type: "uint16" },
      { name: "observationCardinality", type: "uint16" },
      { name: "observationCardinalityNext", type: "uint16" },
      { name: "feeProtocol", type: "uint8" },
      { name: "unlocked", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
