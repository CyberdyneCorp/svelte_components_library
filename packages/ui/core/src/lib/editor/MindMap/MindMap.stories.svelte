<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MindMap from "./MindMap.svelte";

  const { Story } = defineMeta({
    title: "Editor/MindMap",
    component: MindMap,
    tags: ["autodocs"],
  });

  const projectPlanningRoot = {
    id: "root",
    label: "Cyberdyne Platform",
    children: [
      {
        id: "1",
        label: "Backend",
        children: [
          {
            id: "1.1",
            label: "API Gateway",
            children: [
              { id: "1.1.1", label: "Authentication" },
              { id: "1.1.2", label: "Rate Limiting" },
              { id: "1.1.3", label: "Caching" },
            ],
          },
          {
            id: "1.2",
            label: "ML Service",
            children: [
              { id: "1.2.1", label: "Model Training" },
              { id: "1.2.2", label: "Inference API" },
              { id: "1.2.3", label: "Feature Store" },
            ],
          },
          {
            id: "1.3",
            label: "Blockchain",
            children: [
              { id: "1.3.1", label: "Smart Contracts" },
              { id: "1.3.2", label: "Event Listeners" },
            ],
          },
        ],
      },
      {
        id: "2",
        label: "Frontend",
        children: [
          { id: "2.1", label: "Component Library" },
          { id: "2.2", label: "Dashboard" },
          { id: "2.3", label: "Wallet Integration" },
        ],
      },
      {
        id: "3",
        label: "Infrastructure",
        children: [
          { id: "3.1", label: "Kubernetes" },
          { id: "3.2", label: "CI/CD" },
          { id: "3.3", label: "Monitoring" },
        ],
      },
      {
        id: "4",
        label: "Research",
        children: [
          { id: "4.1", label: "Knowledge Graph" },
          { id: "4.2", label: "Vector Search" },
        ],
      },
    ],
  };

  const simpleRoot = {
    id: "root",
    label: "Main Topic",
    children: [
      {
        id: "a",
        label: "Branch A",
        children: [
          { id: "a1", label: "Leaf A1" },
        ],
      },
      {
        id: "b",
        label: "Branch B",
        children: [
          { id: "b1", label: "Leaf B1" },
        ],
      },
    ],
  };
</script>

<Story name="ProjectPlanning" args={{ root: projectPlanningRoot }}>
  {#snippet children(args)}
    <MindMap {...args} onchange={(r) => console.log("changed:", r)} onexport={(md) => console.log("export:\n", md)} />
  {/snippet}
</Story>

<Story name="Simple" args={{ root: simpleRoot }}>
  {#snippet children(args)}
    <MindMap {...args} />
  {/snippet}
</Story>

<Story name="Readonly" args={{ root: projectPlanningRoot, readonly: true }}>
  {#snippet children(args)}
    <MindMap {...args} />
  {/snippet}
</Story>
