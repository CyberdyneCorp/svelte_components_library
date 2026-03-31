/**
 * Shared test/demo data for Storybook stories.
 * Import from "@cyberdynecorp/svelte-ui-core/_testdata" or relatively.
 */

// ─── Crypto Market Data ───────────────────────────────────────

export const cryptoMarket = [
  { rank: 1, token: "BTC", name: "Bitcoin", price: "$67,891.00", marketCap: "$1.33T", change24h: "+1.8%", volume: "$32.1B", sparkline: [64200, 65100, 66300, 65800, 67200, 67891] },
  { rank: 2, token: "ETH", name: "Ethereum", price: "$3,245.12", marketCap: "$390.1B", change24h: "+2.4%", volume: "$18.2B", sparkline: [3050, 3120, 3180, 3150, 3210, 3245] },
  { rank: 3, token: "SOL", name: "Solana", price: "$142.50", marketCap: "$62.3B", change24h: "+5.1%", volume: "$4.8B", sparkline: [128, 132, 135, 138, 140, 142.5] },
  { rank: 4, token: "BNB", name: "BNB Chain", price: "$612.30", marketCap: "$91.2B", change24h: "-0.3%", volume: "$2.1B", sparkline: [618, 615, 614, 613, 611, 612.3] },
  { rank: 5, token: "XRP", name: "Ripple", price: "$0.5412", marketCap: "$29.6B", change24h: "+0.9%", volume: "$1.4B", sparkline: [0.52, 0.525, 0.53, 0.535, 0.538, 0.541] },
  { rank: 6, token: "ADA", name: "Cardano", price: "$0.4523", marketCap: "$16.0B", change24h: "-1.2%", volume: "$620M", sparkline: [0.46, 0.458, 0.455, 0.454, 0.453, 0.452] },
  { rank: 7, token: "AVAX", name: "Avalanche", price: "$35.67", marketCap: "$13.1B", change24h: "+3.7%", volume: "$890M", sparkline: [33.2, 33.8, 34.5, 35.0, 35.3, 35.67] },
  { rank: 8, token: "DOT", name: "Polkadot", price: "$7.12", marketCap: "$9.8B", change24h: "-0.5%", volume: "$410M", sparkline: [7.2, 7.18, 7.15, 7.14, 7.13, 7.12] },
  { rank: 9, token: "LINK", name: "Chainlink", price: "$18.73", marketCap: "$10.9B", change24h: "+1.2%", volume: "$890M", sparkline: [18.1, 18.3, 18.4, 18.5, 18.6, 18.73] },
  { rank: 10, token: "MATIC", name: "Polygon", price: "$0.7234", marketCap: "$6.7B", change24h: "+4.2%", volume: "$520M", sparkline: [0.68, 0.69, 0.7, 0.71, 0.72, 0.723] },
];

export const transactions = [
  { hash: "0x8f2e...a1b3", type: "send" as const, amount: "2.5 ETH", symbol: "ETH", status: "confirmed" as const, timestamp: "2 min ago", to: "0xdead...beef" },
  { hash: "0x3c7d...e9f0", type: "receive" as const, amount: "1,500 USDC", symbol: "USDC", status: "confirmed" as const, timestamp: "15 min ago", from: "0xcafe...babe" },
  { hash: "0xa1b2...c3d4", type: "swap" as const, amount: "0.8 ETH → 2,598 USDC", symbol: "ETH", status: "confirmed" as const, timestamp: "1 hour ago" },
  { hash: "0xe5f6...g7h8", type: "send" as const, amount: "10,000 USDC", symbol: "USDC", status: "pending" as const, timestamp: "Just now", to: "0x1234...5678" },
  { hash: "0xb9c0...d1e2", type: "approve" as const, amount: "∞ USDC", symbol: "USDC", status: "failed" as const, timestamp: "3 hours ago" },
  { hash: "0xf3g4...h5i6", type: "swap" as const, amount: "5 SOL → 0.04 ETH", symbol: "SOL", status: "confirmed" as const, timestamp: "5 hours ago" },
];

// ─── ML Training Data ─────────────────────────────────────────

export const trainingMetrics = {
  loss: [
    { x: 1, y: 2.45 }, { x: 2, y: 1.82 }, { x: 3, y: 1.24 }, { x: 4, y: 0.91 },
    { x: 5, y: 0.68 }, { x: 6, y: 0.52 }, { x: 7, y: 0.41 }, { x: 8, y: 0.34 },
    { x: 9, y: 0.29 }, { x: 10, y: 0.25 }, { x: 11, y: 0.22 }, { x: 12, y: 0.20 },
    { x: 13, y: 0.18 }, { x: 14, y: 0.17 }, { x: 15, y: 0.16 },
  ],
  accuracy: [
    { x: 1, y: 0.42 }, { x: 2, y: 0.58 }, { x: 3, y: 0.68 }, { x: 4, y: 0.75 },
    { x: 5, y: 0.80 }, { x: 6, y: 0.84 }, { x: 7, y: 0.87 }, { x: 8, y: 0.89 },
    { x: 9, y: 0.91 }, { x: 10, y: 0.92 }, { x: 11, y: 0.93 }, { x: 12, y: 0.935 },
    { x: 13, y: 0.94 }, { x: 14, y: 0.942 }, { x: 15, y: 0.945 },
  ],
  valLoss: [
    { x: 1, y: 2.60 }, { x: 2, y: 1.95 }, { x: 3, y: 1.42 }, { x: 4, y: 1.10 },
    { x: 5, y: 0.88 }, { x: 6, y: 0.72 }, { x: 7, y: 0.63 }, { x: 8, y: 0.58 },
    { x: 9, y: 0.55 }, { x: 10, y: 0.53 }, { x: 11, y: 0.52 }, { x: 12, y: 0.52 },
    { x: 13, y: 0.53 }, { x: 14, y: 0.54 }, { x: 15, y: 0.55 },
  ],
};

export const modelBenchmarks = [
  { label: "MMLU", value: 0.945 },
  { label: "HumanEval", value: 0.892 },
  { label: "GSM8K", value: 0.967 },
  { label: "MATH", value: 0.834 },
  { label: "ARC-C", value: 0.912 },
  { label: "HellaSwag", value: 0.978 },
  { label: "TruthfulQA", value: 0.756 },
  { label: "Winogrande", value: 0.891 },
];

export const confusionMatrix = {
  data: [
    [142, 8, 3, 1],
    [12, 128, 6, 2],
    [5, 9, 135, 4],
    [2, 3, 7, 138],
  ],
  labels: ["Transaction", "Smart Contract", "Token Transfer", "Bridge"],
};

// ─── DeFi Portfolio Data ──────────────────────────────────────

export const portfolioTimeline = [
  { x: 1, y: 45000 }, { x: 2, y: 48200 }, { x: 3, y: 52100 }, { x: 4, y: 49800 },
  { x: 5, y: 54300 }, { x: 6, y: 58900 }, { x: 7, y: 56200 }, { x: 8, y: 62400 },
  { x: 9, y: 67800 }, { x: 10, y: 71200 }, { x: 11, y: 68900 }, { x: 12, y: 74500 },
];

export const assetAllocation = {
  eth: [
    { x: 1, y: 25000 }, { x: 2, y: 27100 }, { x: 3, y: 29500 }, { x: 4, y: 28200 },
    { x: 5, y: 31000 }, { x: 6, y: 33800 }, { x: 7, y: 32100 }, { x: 8, y: 35700 },
    { x: 9, y: 38900 }, { x: 10, y: 41000 }, { x: 11, y: 39500 }, { x: 12, y: 42800 },
  ],
  stablecoins: [
    { x: 1, y: 12000 }, { x: 2, y: 12500 }, { x: 3, y: 13200 }, { x: 4, y: 13600 },
    { x: 5, y: 14100 }, { x: 6, y: 14800 }, { x: 7, y: 15200 }, { x: 8, y: 16000 },
    { x: 9, y: 16800 }, { x: 10, y: 17500 }, { x: 11, y: 17800 }, { x: 12, y: 18200 },
  ],
  defi: [
    { x: 1, y: 8000 }, { x: 2, y: 8600 }, { x: 3, y: 9400 }, { x: 4, y: 8000 },
    { x: 5, y: 9200 }, { x: 6, y: 10300 }, { x: 7, y: 8900 }, { x: 8, y: 10700 },
    { x: 9, y: 12100 }, { x: 10, y: 12700 }, { x: 11, y: 11600 }, { x: 12, y: 13500 },
  ],
};

// ─── Validator & Node Data ────────────────────────────────────

export const validatorNodes = [
  { node: "cy-node-01", region: "US-East", uptime: "99.99%", stake: "32.00 ETH", rewards: "1.245 ETH", blocks: "12,847", status: "Active" },
  { node: "cy-node-02", region: "EU-West", uptime: "99.97%", stake: "32.00 ETH", rewards: "1.198 ETH", blocks: "12,341", status: "Active" },
  { node: "cy-node-03", region: "AP-Tokyo", uptime: "99.95%", stake: "32.00 ETH", rewards: "1.156 ETH", blocks: "11,982", status: "Active" },
  { node: "cy-node-04", region: "US-West", uptime: "99.91%", stake: "32.00 ETH", rewards: "1.102 ETH", blocks: "11,540", status: "Syncing" },
  { node: "cy-node-05", region: "EU-Central", uptime: "98.45%", stake: "32.00 ETH", rewards: "0.987 ETH", blocks: "10,234", status: "Warning" },
  { node: "cy-node-06", region: "SA-East", uptime: "—", stake: "32.00 ETH", rewards: "0.000 ETH", blocks: "0", status: "Offline" },
];

// ─── Knowledge Graph Data ─────────────────────────────────────

export const cyberdyneKnowledgeGraph = {
  nodes: [
    // Core concepts
    { id: "blockchain", label: "Blockchain", group: "Infrastructure", size: 14, metadata: { type: "concept", importance: "critical" } },
    { id: "ml", label: "Machine Learning", group: "AI/ML", size: 14, metadata: { type: "concept", importance: "critical" } },
    { id: "defi", label: "DeFi", group: "Finance", size: 12, metadata: { type: "concept", importance: "high" } },
    { id: "research", label: "Research", group: "Science", size: 10 },

    // Blockchain branch
    { id: "ethereum", label: "Ethereum", group: "Infrastructure", size: 12, metadata: { chainId: 1 } },
    { id: "solidity", label: "Solidity", group: "Infrastructure", size: 8 },
    { id: "smart-contracts", label: "Smart Contracts", group: "Infrastructure", size: 10 },
    { id: "nft", label: "NFTs", group: "Infrastructure", size: 8 },
    { id: "erc20", label: "ERC-20", group: "Infrastructure", size: 6 },
    { id: "erc721", label: "ERC-721", group: "Infrastructure", size: 6 },

    // DeFi branch
    { id: "uniswap", label: "Uniswap", group: "Finance", size: 10, metadata: { tvl: "$4.2B" } },
    { id: "aave", label: "Aave", group: "Finance", size: 10, metadata: { tvl: "$12.8B" } },
    { id: "yield-farming", label: "Yield Farming", group: "Finance", size: 8 },
    { id: "liquidity", label: "Liquidity Pools", group: "Finance", size: 8 },
    { id: "amm", label: "AMM", group: "Finance", size: 7 },

    // ML branch
    { id: "neural-nets", label: "Neural Networks", group: "AI/ML", size: 10 },
    { id: "transformers", label: "Transformers", group: "AI/ML", size: 10, metadata: { year: "2017" } },
    { id: "llm", label: "LLMs", group: "AI/ML", size: 12, metadata: { examples: "GPT, Claude" } },
    { id: "computer-vision", label: "Computer Vision", group: "AI/ML", size: 9 },
    { id: "yolo", label: "YOLO", group: "AI/ML", size: 7, metadata: { version: "v8" } },
    { id: "rl", label: "Reinforcement Learning", group: "AI/ML", size: 8 },

    // Cyberdyne products
    { id: "cyberdynedao", label: "CyberdyneDAO", group: "Products", size: 12, metadata: { status: "Active" } },
    { id: "yieldpath", label: "YieldPath", group: "Products", size: 10, metadata: { status: "Development" } },
    { id: "vision-factory", label: "Vision Factory", group: "Products", size: 10, metadata: { status: "Active" } },
    { id: "terraform-game", label: "Terraform Game", group: "Products", size: 9, metadata: { status: "Design" } },

    // Research
    { id: "pgvector", label: "pgvector", group: "Science", size: 7 },
    { id: "apache-age", label: "Apache AGE", group: "Science", size: 7, metadata: { db: "PostgreSQL" } },
    { id: "embeddings", label: "Embeddings", group: "Science", size: 8 },
    { id: "graph-db", label: "Graph Databases", group: "Science", size: 8 },
  ],
  edges: [
    // Core connections
    { source: "blockchain", target: "ethereum" },
    { source: "blockchain", target: "smart-contracts" },
    { source: "blockchain", target: "defi", weight: 3 },
    { source: "ml", target: "neural-nets" },
    { source: "ml", target: "transformers" },
    { source: "ml", target: "computer-vision" },
    { source: "ml", target: "rl" },
    { source: "ml", target: "research", weight: 2 },

    // Blockchain
    { source: "ethereum", target: "solidity" },
    { source: "ethereum", target: "erc20" },
    { source: "ethereum", target: "erc721" },
    { source: "smart-contracts", target: "solidity" },
    { source: "smart-contracts", target: "nft" },
    { source: "nft", target: "erc721" },
    { source: "erc20", target: "defi" },

    // DeFi
    { source: "defi", target: "uniswap" },
    { source: "defi", target: "aave" },
    { source: "defi", target: "yield-farming" },
    { source: "defi", target: "liquidity" },
    { source: "uniswap", target: "amm" },
    { source: "uniswap", target: "liquidity" },
    { source: "aave", target: "yield-farming" },
    { source: "amm", target: "liquidity" },

    // ML
    { source: "neural-nets", target: "transformers" },
    { source: "transformers", target: "llm", weight: 3 },
    { source: "computer-vision", target: "yolo" },
    { source: "neural-nets", target: "rl" },

    // Products
    { source: "cyberdynedao", target: "blockchain", weight: 3 },
    { source: "cyberdynedao", target: "nft", weight: 2 },
    { source: "cyberdynedao", target: "smart-contracts" },
    { source: "yieldpath", target: "defi", weight: 3 },
    { source: "yieldpath", target: "ml", weight: 2 },
    { source: "yieldpath", target: "yield-farming" },
    { source: "vision-factory", target: "computer-vision", weight: 3 },
    { source: "vision-factory", target: "yolo", weight: 2 },
    { source: "terraform-game", target: "blockchain" },
    { source: "terraform-game", target: "nft" },
    { source: "terraform-game", target: "rl" },

    // Research
    { source: "research", target: "pgvector" },
    { source: "research", target: "apache-age" },
    { source: "research", target: "embeddings" },
    { source: "research", target: "graph-db" },
    { source: "pgvector", target: "embeddings" },
    { source: "apache-age", target: "graph-db" },
    { source: "llm", target: "embeddings" },
  ],
};

// ─── System Logs ──────────────────────────────────────────────

export const systemLogs = [
  { timestamp: "2026-03-27T14:23:01Z", level: "info" as const, message: "Model CyberNet-v3 loaded successfully (70B params, 4-bit quantized)", source: "ml-service" },
  { timestamp: "2026-03-27T14:23:02Z", level: "info" as const, message: "GPU allocation: 4x A100 80GB, VRAM usage: 68.2GB/320GB", source: "gpu-manager" },
  { timestamp: "2026-03-27T14:23:05Z", level: "debug" as const, message: "Batch inference request: 128 samples, avg latency 42ms", source: "ml-service" },
  { timestamp: "2026-03-27T14:23:08Z", level: "info" as const, message: "Block #18,234,891 confirmed, 3 CyberdyneDAO transactions included", source: "chain-watcher" },
  { timestamp: "2026-03-27T14:23:12Z", level: "warn" as const, message: "LP position USDC/ETH approaching lower bound (current: $3,180, bound: $3,100)", source: "yieldpath" },
  { timestamp: "2026-03-27T14:23:15Z", level: "info" as const, message: "Vision pipeline processed frame 12847, 3 objects detected, confidence > 0.95", source: "vision-factory" },
  { timestamp: "2026-03-27T14:23:18Z", level: "error" as const, message: "RPC endpoint eth-mainnet-03 timeout after 5000ms, failover to eth-mainnet-04", source: "rpc-proxy" },
  { timestamp: "2026-03-27T14:23:20Z", level: "info" as const, message: "Auto-rebalance triggered for vault 0x1a2B...3c4D, gas estimate: 0.0034 ETH", source: "yieldpath" },
  { timestamp: "2026-03-27T14:23:22Z", level: "debug" as const, message: "pgvector similarity search: 42 results in 3.2ms (dim=1536, index=ivfflat)", source: "search-service" },
  { timestamp: "2026-03-27T14:23:25Z", level: "warn" as const, message: "Gas price spike detected: 45 gwei → 120 gwei, delaying non-urgent transactions", source: "gas-oracle" },
  { timestamp: "2026-03-27T14:23:28Z", level: "info" as const, message: "Knowledge graph updated: 3 new edges added via Apache AGE", source: "graph-service" },
  { timestamp: "2026-03-27T14:23:30Z", level: "error" as const, message: "Validator cy-node-05 missed attestation for slot 8,291,034, investigating", source: "validator-monitor" },
];

// ─── Terminal Output ──────────────────────────────────────────

export const deploymentTerminal = [
  { text: "$ cyberdyne deploy --env production --chain ethereum", type: "command" as const },
  { text: "Compiling smart contracts...", type: "info" as const },
  { text: "  ✓ CyberdyneAccessNFT.sol (0.8.20)", type: "stdout" as const },
  { text: "  ✓ YieldVault.sol (0.8.20)", type: "stdout" as const },
  { text: "  ✓ GovernanceToken.sol (0.8.20)", type: "stdout" as const },
  { text: "Running 52 tests...", type: "info" as const },
  { text: "  Suite: Access Control — 18/18 passed", type: "stdout" as const },
  { text: "  Suite: Yield Strategies — 22/22 passed", type: "stdout" as const },
  { text: "  Suite: Governance — 12/12 passed", type: "stdout" as const },
  { text: "All 52 tests passed ✓", type: "info" as const },
  { text: "", type: "stdout" as const },
  { text: "Deploying to Ethereum mainnet...", type: "info" as const },
  { text: "  Gas estimate: 0.0847 ETH ($275.23 @ 42 gwei)", type: "stdout" as const },
  { text: "  Tx: 0x8f2e...a1b3 — confirmed in block #18,234,892", type: "stdout" as const },
  { text: "  Contract: 0xCyb3...Dyn3", type: "stdout" as const },
  { text: "", type: "stdout" as const },
  { text: "Verifying on Etherscan...", type: "info" as const },
  { text: "  ✓ Contract verified: https://etherscan.io/address/0xCyb3...Dyn3", type: "stdout" as const },
  { text: "Deployment complete. 3 contracts deployed, 0.0847 ETH spent.", type: "info" as const },
];
