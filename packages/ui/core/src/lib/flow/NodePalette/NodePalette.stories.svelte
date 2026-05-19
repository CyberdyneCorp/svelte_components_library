<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import NodePalette from "./NodePalette.svelte";

  const { Story } = defineMeta({
    title: "Flow/NodePalette",
    component: NodePalette,
    tags: ["autodocs"],
  });

  const groups = [
    {
      name: "Region",
      color: "#22D3EE",
      items: [{ type: "aoi", label: "Area of Interest", sub: "AOI" }],
    },
    {
      name: "Sentinel data sources",
      color: "#5FA8FF",
      items: [
        { type: "s1", label: "Sentinel-1 SAR", sub: "S1" },
        { type: "s2", label: "Sentinel-2 Optical", sub: "S2" },
        { type: "s3", label: "Sentinel-3 Ocean/LST", sub: "S3" },
        { type: "s5p", label: "Sentinel-5P Atmosphere", sub: "S5P" },
      ],
    },
    {
      name: "Indices & products",
      color: "#3FE07F",
      items: [
        { type: "ndvi", label: "NDVI", sub: "S2" },
        { type: "flood", label: "SAR Flood Extent", sub: "S1" },
        { type: "nbr", label: "NBR / Burned Area", sub: "S2" },
      ],
    },
    {
      name: "Logic",
      color: "#A855F7",
      items: [
        { type: "and", label: "AND", sub: "∧" },
        { type: "or", label: "OR", sub: "∨" },
        { type: "not", label: "NOT", sub: "¬" },
      ],
    },
    {
      name: "Payout & alerts",
      color: "#FB7185",
      items: [
        { type: "payout", label: "Trigger payout", sub: "$" },
        { type: "notify", label: "Alert / webhook", sub: "@" },
      ],
    },
  ];
</script>

<Story name="Default">
  <div style="height: 600px; display: flex;">
    <NodePalette {groups} />
    <div style="flex: 1; background: var(--color-bg-primary);"></div>
  </div>
</Story>
