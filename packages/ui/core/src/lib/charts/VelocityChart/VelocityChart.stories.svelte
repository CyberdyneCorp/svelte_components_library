<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import VelocityChart from "./VelocityChart.svelte";

  const { Story } = defineMeta({
    title: "Charts/VelocityChart",
    component: VelocityChart,
    tags: ["autodocs"],
  });

  const defaultSprints = [
    { name: "Sprint 18", completed: 28, committed: 30 },
    { name: "Sprint 19", completed: 32, committed: 30 },
    { name: "Sprint 20", completed: 25, committed: 28 },
    { name: "Sprint 21", completed: 30, committed: 30 },
    { name: "Sprint 22", completed: 35, committed: 32 },
    { name: "Sprint 23", completed: 22, committed: 30 },
    { name: "Sprint 24", completed: 29, committed: 28 },
    { name: "Sprint 25", completed: 31, committed: 30 },
  ];

  const withoutCommittedSprints = [
    { name: "Sprint 18", completed: 28 },
    { name: "Sprint 19", completed: 32 },
    { name: "Sprint 20", completed: 25 },
    { name: "Sprint 21", completed: 30 },
    { name: "Sprint 22", completed: 35 },
    { name: "Sprint 23", completed: 22 },
    { name: "Sprint 24", completed: 29 },
    { name: "Sprint 25", completed: 31 },
  ];
</script>

<Story name="Default" args={{ sprints: defaultSprints }} />

<Story name="WithoutCommitted" args={{ sprints: withoutCommittedSprints, showCommitted: false }} />
