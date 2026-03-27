<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Kanban from "./Kanban.svelte";

  const sprintColumns = [
    {
      id: "backlog",
      title: "Backlog",
      color: "#555570",
      items: [
        { id: "b1", title: "Train GPT-5 fine-tune model", description: "Set up distributed training pipeline for custom LLM fine-tuning on proprietary dataset", tags: ["ML", "GPU"], priority: "high", assignee: "Sarah K." },
        { id: "b2", title: "Smart contract audit", description: "Review and audit Solidity contracts for token bridge vulnerability", tags: ["Solidity", "Security"], priority: "critical", assignee: "Alex R." },
        { id: "b3", title: "Redesign dashboard UI", description: "Implement new dark cyberpunk theme across all dashboard views", tags: ["UI", "Design"], priority: "medium" },
        { id: "b4", title: "Add WebSocket support", description: "Real-time price feed integration via WebSocket connections", tags: ["Backend"], priority: "low" },
      ],
    },
    {
      id: "in-progress",
      title: "In Progress",
      color: "#00d4ff",
      items: [
        { id: "p1", title: "Deploy ML inference API", description: "Containerize model serving with TensorRT optimization", tags: ["ML", "DevOps"], priority: "high", assignee: "Jordan M." },
        { id: "p2", title: "Build token swap widget", description: "Cross-chain swap interface with slippage protection", tags: ["DeFi", "Frontend"], priority: "medium", assignee: "Kai L." },
        { id: "p3", title: "Optimize graph queries", description: "Reduce Neo4j query latency for knowledge graph traversals", tags: ["Backend", "DB"], priority: "high" },
      ],
    },
    {
      id: "review",
      title: "Review",
      color: "#ffaa00",
      items: [
        { id: "r1", title: "NFT marketplace filters", description: "Advanced filtering by traits, rarity, and price range", tags: ["Frontend"], priority: "medium", assignee: "Sam T." },
        { id: "r2", title: "Rate limiter middleware", description: "Redis-backed rate limiting for API gateway", tags: ["Backend", "Security"], priority: "high", assignee: "Alex R." },
        { id: "r3", title: "Unit tests for wallet SDK", tags: ["Testing"], priority: "low", assignee: "Jordan M." },
      ],
    },
    {
      id: "done",
      title: "Done",
      color: "#00ff41",
      items: [
        { id: "d1", title: "Setup CI/CD pipeline", description: "GitHub Actions with Docker builds and staging deploy", tags: ["DevOps"], priority: "medium", assignee: "Kai L." },
        { id: "d2", title: "Integrate price oracle", tags: ["Solidity", "DeFi"], priority: "high", assignee: "Sarah K." },
        { id: "d3", title: "Add dark mode toggle", tags: ["UI"], priority: "low", assignee: "Sam T." },
        { id: "d4", title: "Database migration v3", description: "Migrate from PostgreSQL 14 to 16 with zero downtime", tags: ["DB", "DevOps"], priority: "critical" },
      ],
    },
  ];

  const simpleColumns = [
    {
      id: "todo",
      title: "To Do",
      color: "#00d4ff",
      items: [
        { id: "s1", title: "Research vector databases", description: "Compare Pinecone, Weaviate, and Milvus", tags: ["Research"], priority: "medium" },
        { id: "s2", title: "Write API documentation", tags: ["Docs"], priority: "low" },
      ],
    },
    {
      id: "doing",
      title: "Doing",
      color: "#ffaa00",
      items: [
        { id: "s3", title: "Implement auth flow", description: "OAuth2 + wallet-based authentication", tags: ["Auth"], priority: "high" },
        { id: "s4", title: "Design component library", tags: ["Design"], priority: "medium" },
      ],
    },
    {
      id: "complete",
      title: "Complete",
      color: "#00ff41",
      items: [
        { id: "s5", title: "Setup monorepo", tags: ["DevOps"], priority: "low" },
        { id: "s6", title: "Configure ESLint rules", tags: ["DX"], priority: "low" },
      ],
    },
  ];

  const { Story } = defineMeta({
    title: "Data Display/Kanban",
    component: Kanban,
    tags: ["autodocs"],
    args: {
      columns: sprintColumns,
    },
  });
</script>

<Story name="SprintBoard" args={{ columns: sprintColumns }} />

<Story name="SimpleBoard" args={{ columns: simpleColumns }} />
