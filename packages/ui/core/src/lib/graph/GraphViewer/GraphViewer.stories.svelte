<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import GraphViewer from "./GraphViewer.svelte";
  import { cyberdyneKnowledgeGraph } from "../../_testdata/index.js";

  const { Story } = defineMeta({
    title: "Graph/GraphViewer",
    component: GraphViewer,
    tags: ["autodocs"],
  });

  // Knowledge Graph data
  const knowledgeNodes = [
    { id: "ml", label: "Machine Learning", group: "ML Fundamentals", metadata: { field: "AI", since: "1959" } },
    { id: "nn", label: "Neural Networks", group: "ML Fundamentals" },
    { id: "dl", label: "Deep Learning", group: "ML Fundamentals" },
    { id: "nlp", label: "NLP", group: "ML Fundamentals" },
    { id: "cv", label: "Computer Vision", group: "ML Fundamentals" },
    { id: "transformers", label: "Transformers", group: "Architectures" },
    { id: "cnn", label: "CNNs", group: "Architectures" },
    { id: "rnn", label: "RNNs", group: "Architectures" },
    { id: "attention", label: "Attention", group: "Architectures" },
    { id: "bert", label: "BERT", group: "Models", metadata: { params: "110M", year: "2018" } },
    { id: "gpt", label: "GPT", group: "Models", metadata: { params: "175B", year: "2020" } },
    { id: "pytorch", label: "PyTorch", group: "Frameworks" },
    { id: "tensorflow", label: "TensorFlow", group: "Frameworks" },
    { id: "backprop", label: "Backpropagation", group: "ML Fundamentals" },
    { id: "loss", label: "Loss Functions", group: "ML Fundamentals" },
  ];

  const knowledgeEdges = [
    { source: "ml", target: "nn" },
    { source: "ml", target: "dl" },
    { source: "ml", target: "nlp" },
    { source: "ml", target: "cv" },
    { source: "nn", target: "dl" },
    { source: "nn", target: "backprop" },
    { source: "dl", target: "transformers" },
    { source: "dl", target: "cnn" },
    { source: "dl", target: "rnn" },
    { source: "nlp", target: "transformers" },
    { source: "nlp", target: "bert" },
    { source: "nlp", target: "gpt" },
    { source: "cv", target: "cnn" },
    { source: "transformers", target: "attention" },
    { source: "transformers", target: "bert" },
    { source: "transformers", target: "gpt" },
    { source: "attention", target: "bert" },
    { source: "attention", target: "gpt" },
    { source: "rnn", target: "nlp" },
    { source: "backprop", target: "loss" },
    { source: "pytorch", target: "dl" },
    { source: "tensorflow", target: "dl" },
    { source: "pytorch", target: "bert" },
    { source: "tensorflow", target: "gpt" },
  ];

  // Blockchain Network data
  const blockchainNodes = [
    { id: "w1", label: "0x1a2B...3c4D", group: "Whales", size: 14, metadata: { balance: "12,450 ETH" } },
    { id: "w2", label: "0x5e6F...7a8B", group: "Whales", size: 12, metadata: { balance: "8,200 ETH" } },
    { id: "d1", label: "Uniswap V3", group: "DEX", size: 16, metadata: { tvl: "$4.2B" } },
    { id: "d2", label: "SushiSwap", group: "DEX", size: 10 },
    { id: "p1", label: "Aave V3", group: "DeFi Protocols", size: 14, metadata: { tvl: "$12.8B" } },
    { id: "p2", label: "Compound", group: "DeFi Protocols", size: 12 },
    { id: "p3", label: "MakerDAO", group: "DeFi Protocols", size: 13, metadata: { tvl: "$8.1B" } },
    { id: "u1", label: "0xaB12...cD34", group: "Regular Users", size: 6 },
    { id: "u2", label: "0xeF56...gH78", group: "Regular Users", size: 6 },
    { id: "u3", label: "0xiJ90...kL12", group: "Regular Users", size: 6 },
    { id: "u4", label: "0xmN34...oP56", group: "Regular Users", size: 7 },
    { id: "u5", label: "0xqR78...sT90", group: "Regular Users", size: 6 },
  ];

  const blockchainEdges = [
    { source: "w1", target: "d1", weight: 4, label: "swap" },
    { source: "w1", target: "p1", weight: 5, label: "deposit" },
    { source: "w2", target: "d1", weight: 3, label: "swap" },
    { source: "w2", target: "p3", weight: 4, label: "mint DAI" },
    { source: "d1", target: "d2", weight: 2 },
    { source: "p1", target: "p2", weight: 2 },
    { source: "p1", target: "p3", weight: 3 },
    { source: "u1", target: "d1", weight: 1 },
    { source: "u2", target: "d1", weight: 1 },
    { source: "u3", target: "p1", weight: 1 },
    { source: "u4", target: "d2", weight: 1 },
    { source: "u5", target: "p2", weight: 1 },
    { source: "u1", target: "u2", weight: 1 },
    { source: "w1", target: "w2", weight: 3, label: "transfer" },
  ];

  // Small Graph data
  const smallNodes = [
    { id: "a", label: "Alpha", group: "Core" },
    { id: "b", label: "Beta", group: "Core" },
    { id: "c", label: "Gamma", group: "Outer" },
    { id: "d", label: "Delta", group: "Outer" },
    { id: "e", label: "Epsilon", group: "Outer" },
  ];

  const smallEdges = [
    { source: "a", target: "b" },
    { source: "a", target: "c" },
    { source: "b", target: "c" },
    { source: "b", target: "d" },
    { source: "c", target: "e" },
    { source: "d", target: "e" },
  ];

  // Large Graph data
  function generateLargeGraph(count) {
    const groups = ["Cluster A", "Cluster B", "Cluster C", "Cluster D", "Cluster E"];
    const nodes = [];
    const edges = [];

    for (let i = 0; i < count; i++) {
      nodes.push({
        id: `n${i}`,
        label: `Node ${i}`,
        group: groups[Math.floor(i / (count / groups.length))],
        size: 4 + Math.random() * 8,
      });
    }

    // connect within clusters
    for (let i = 0; i < count; i++) {
      const clusterStart = Math.floor(i / (count / groups.length)) * (count / groups.length);
      const clusterEnd = clusterStart + (count / groups.length);
      const connections = 1 + Math.floor(Math.random() * 3);
      for (let c = 0; c < connections; c++) {
        const target = Math.floor(clusterStart + Math.random() * (clusterEnd - clusterStart));
        if (target !== i) {
          edges.push({ source: `n${i}`, target: `n${target}`, weight: 0.5 + Math.random() });
        }
      }
    }

    // cross-cluster edges
    for (let i = 0; i < count * 0.1; i++) {
      const a = Math.floor(Math.random() * count);
      const b = Math.floor(Math.random() * count);
      if (a !== b) {
        edges.push({ source: `n${a}`, target: `n${b}`, weight: 0.3 });
      }
    }

    return { nodes, edges };
  }

  const largeGraph = generateLargeGraph(100);
</script>

<Story name="KnowledgeGraph" args={{
  nodes: knowledgeNodes,
  edges: knowledgeEdges,
  height: "650px",
  config: { linkDistance: 120, chargeStrength: -400 },
}} />

<Story name="BlockchainNetwork" args={{
  nodes: blockchainNodes,
  edges: blockchainEdges,
  height: "650px",
  config: { showEdgeLabels: true, linkDistance: 140, chargeStrength: -500 },
}} />

<Story name="SmallGraph" args={{
  nodes: smallNodes,
  edges: smallEdges,
  height: "400px",
}} />

<Story name="LargeGraph" args={{
  nodes: largeGraph.nodes,
  edges: largeGraph.edges,
  height: "700px",
  config: { nodeRadius: 5, linkDistance: 60, chargeStrength: -150, showLabels: false },
}} />

<Story name="Cyberdyne Ecosystem" args={{
  nodes: cyberdyneKnowledgeGraph.nodes,
  edges: cyberdyneKnowledgeGraph.edges,
  height: "750px",
  config: { linkDistance: 130, chargeStrength: -450, showEdgeLabels: false },
}} />
