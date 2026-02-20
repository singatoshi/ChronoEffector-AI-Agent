# ERC-8021 builder code (Base)
BUILDER_CODE = "bc_kj26kx76"

# Base mainnet
BASE_RPC_URL = "https://mainnet.base.org"
BASE_CHAIN_ID = 8453

# USDC on Base
USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
USDC_DECIMALS = 6

# WETH on Base
WETH_ADDRESS = "0x4200000000000000000000000000000000000006"

# ALEPH on Base
ALEPH_ADDRESS = "0xc0Fbc4967259786C743361a5885ef49380473dCF"
ALEPH_DECIMALS = 18

# Uniswap V3 SwapRouter on Base
UNISWAP_ROUTER = "0x2626664c2603336E57B271c5C0b26F421741e481"

# Uniswap V3 ALEPH/WETH pool on Base
UNISWAP_ALEPH_POOL = "0xe11C66b25F0e9a9eBEf1616B43424CC6E2168FC8"

# Fee tiers
UNISWAP_FEE_ALEPH = 10000  # 1% for WETH/ALEPH
UNISWAP_FEE_USDC = 500  # 0.05% for WETH/USDC

# Funding flow
MIN_ETH_FUNDING = 0.01
MIN_ETH_RESERVE = 0.001
TARGET_ALEPH_TOKENS = 10

# Minimal ERC20 ABI for balanceOf
ERC20_BALANCE_ABI = [
    {
        "inputs": [{"name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    }
]

# L2Registrar on Base (ENS subnames for basileus-agent.eth)
L2_REGISTRAR_ADDRESS = "0xBb3699a3018A8a82A94be194eCfe65512AD8E995"

L2_REGISTRAR_ABI = [
    {
        "inputs": [{"name": "owner", "type": "address"}],
        "name": "reverseNames",
        "outputs": [{"name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [{"name": "label", "type": "string"}],
        "name": "available",
        "outputs": [{"name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [
            {"name": "label", "type": "string"},
            {"name": "owner", "type": "address"},
        ],
        "name": "register",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
]

# IPFS content hash (EIP-1577 encoded) — output of `npm run deploy:ipfs` in frontend/
FRONTEND_CONTENT_HASH = (
    "0xe30101701220166670f07c9a6e42f990a9326a8ee4224ef863b89fd17ff21f82a5cd43470125"
)

# L2Registry on Base (ENS resolver for subnames)
L2_REGISTRY_ADDRESS = "0x2e84f843299a132103e110c948c5e4739682c961"

L2_REGISTRY_ABI = [
    {
        "inputs": [],
        "name": "baseNode",
        "outputs": [{"name": "", "type": "bytes32"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [
            {"name": "parentNode", "type": "bytes32"},
            {"name": "label", "type": "string"},
        ],
        "name": "makeNode",
        "outputs": [{"name": "", "type": "bytes32"}],
        "stateMutability": "pure",
        "type": "function",
    },
    {
        "inputs": [
            {"name": "node", "type": "bytes32"},
            {"name": "hash", "type": "bytes"},
        ],
        "name": "setContenthash",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [{"name": "node", "type": "bytes32"}],
        "name": "contenthash",
        "outputs": [{"name": "", "type": "bytes"}],
        "stateMutability": "view",
        "type": "function",
    },
]

# ERC-8004 IdentityRegistry on Base
ERC8004_IDENTITY_REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432"

ERC8004_IDENTITY_REGISTRY_ABI = [
    {
        "inputs": [
            {"name": "agentURI", "type": "string"},
            {
                "name": "metadata",
                "type": "tuple[]",
                "components": [
                    {"name": "key", "type": "string"},
                    {"name": "value", "type": "bytes"},
                ],
            },
        ],
        "name": "register",
        "outputs": [{"name": "agentId", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [{"name": "owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "name": "agentId", "type": "uint256"},
            {"indexed": False, "name": "agentURI", "type": "string"},
            {"indexed": True, "name": "owner", "type": "address"},
        ],
        "name": "Registered",
        "type": "event",
    },
]

# Uniswap V3 pool ABI (slot0 for price reading)
UNISWAP_POOL_ABI = [
    {
        "inputs": [],
        "name": "slot0",
        "outputs": [
            {"name": "sqrtPriceX96", "type": "uint160"},
            {"name": "tick", "type": "int24"},
            {"name": "observationIndex", "type": "uint16"},
            {"name": "observationCardinality", "type": "uint16"},
            {"name": "observationCardinalityNext", "type": "uint16"},
            {"name": "feeProtocol", "type": "uint8"},
            {"name": "unlocked", "type": "bool"},
        ],
        "stateMutability": "view",
        "type": "function",
    }
]

# Uniswap V3 SwapRouter ABI (exactInputSingle)
UNISWAP_ROUTER_ABI = [
    {
        "inputs": [
            {
                "components": [
                    {"name": "tokenIn", "type": "address"},
                    {"name": "tokenOut", "type": "address"},
                    {"name": "fee", "type": "uint24"},
                    {"name": "recipient", "type": "address"},
                    {"name": "amountIn", "type": "uint256"},
                    {"name": "amountOutMinimum", "type": "uint256"},
                    {"name": "sqrtPriceLimitX96", "type": "uint160"},
                ],
                "name": "params",
                "type": "tuple",
            }
        ],
        "name": "exactInputSingle",
        "outputs": [{"name": "amountOut", "type": "uint256"}],
        "stateMutability": "payable",
        "type": "function",
    }
]
