<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import VennDiagram from "./VennDiagram.svelte";

  const { Story } = defineMeta({
    title: "Charts/VennDiagram",
    component: VennDiagram,
    tags: ["autodocs"],
  });

  const twoSets = {
    sets: [
      { label: "Python Devs", size: 850 },
      { label: "ML Engineers", size: 420 },
    ],
    overlaps: [
      { sets: [0, 1], size: 310, label: "310" },
    ],
  };

  const threeSets = {
    sets: [
      { label: "Frontend", size: 1200, color: "#00ff41" },
      { label: "Backend", size: 980, color: "#00d4ff" },
      { label: "DevOps", size: 560, color: "#a855f7" },
    ],
    overlaps: [
      { sets: [0, 1], size: 340, label: "Full Stack" },
      { sets: [0, 2], size: 120, label: "120" },
      { sets: [1, 2], size: 280, label: "280" },
      { sets: [0, 1, 2], size: 85, label: "85" },
    ],
  };

  const defi = {
    sets: [
      { label: "Ethereum", size: 2400 },
      { label: "Solana", size: 1100 },
    ],
    overlaps: [
      { sets: [0, 1], size: 450, label: "Cross-chain" },
    ],
  };

  const mlSkills = {
    sets: [
      { label: "Statistics", size: 600, color: "#00d4ff" },
      { label: "Programming", size: 900, color: "#00ff41" },
      { label: "Domain Knowledge", size: 500, color: "#ffb800" },
    ],
    overlaps: [
      { sets: [0, 1], size: 280, label: "Data Science" },
      { sets: [0, 2], size: 150, label: "Research" },
      { sets: [1, 2], size: 200, label: "Engineering" },
      { sets: [0, 1, 2], size: 95, label: "ML Expert" },
    ],
  };
</script>

<Story name="TwoSets" args={{ ...twoSets }} />

<Story name="ThreeSets" args={{ ...threeSets }} />

<Story name="DeFiOverlap" args={{ ...defi }} />

<Story name="MLSkills" args={{ ...mlSkills }} />

<Story name="NoValues" args={{ ...threeSets, showValues: false }} />
