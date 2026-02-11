import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const privateKey = generatePrivateKey();
const account = privateKeyToAccount(privateKey);

console.log("=== New Basileus Wallet ===");
console.log(`Address:     ${account.address}`);
console.log(`Private Key: ${privateKey}`);
console.log("");
console.log("Next steps:");
console.log("1. Add to agent/.env: BASE_CHAIN_WALLET_KEY=" + privateKey);
console.log("2. Fund with testnet USDC: https://faucet.circle.com (Base Sepolia)");
console.log("3. Start agent: npm start");
