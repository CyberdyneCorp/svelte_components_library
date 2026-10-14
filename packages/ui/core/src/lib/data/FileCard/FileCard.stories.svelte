<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FileCard from "./FileCard.svelte";

  const { Story } = defineMeta({
    title: "Data/FileCard",
    component: FileCard,
    tags: ["autodocs"],
    parameters: {
      a11y: { test: "error" },
    },
    argTypes: {
      layout: { control: "inline-radio", options: ["tile", "row"] },
      progress: { control: { type: "range", min: 0, max: 100 } },
    },
  });

  // A tiny inline SVG so the story needs no network.
  const thumbnail =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="#2b6cb0"/><circle cx="1.2" cy="1" r=".5" fill="#f6e05e"/><path d="M0 3 1.6 1.6 2.6 2.4 4 1.2V3z" fill="#2f855a"/></svg>',
    );

  const attachments = [
    { name: "quarterly-report.pdf", meta: "1.2 MB" },
    { name: "architecture-diagram.png", meta: "240 KB" },
    { name: "customers.csv", meta: "88 KB", progress: 65 },
    { name: "walkthrough.mp4", meta: "48 MB", error: "Upload failed" },
  ];
</script>

<Story name="Tile" args={{ name: "quarterly-report.pdf", meta: "1.2 MB" }} />

<Story name="Tile with image" args={{ name: "landscape.png", meta: "240 KB", previewSrc: thumbnail, onopen: () => {}, onremove: () => {} }} />

<Story name="Uploading" args={{ name: "customers.csv", meta: "88 KB", progress: 65, onremove: () => {} }} />

<Story name="Failed" args={{ name: "walkthrough.mp4", meta: "48 MB", error: "Upload failed", onremove: () => {} }} />

<!-- Chat-style attachment strip using the row layout. -->
<Story name="Attachment rows" asChild>
  <ul style="display: grid; gap: 0.5rem; list-style: none; padding: 0; margin: 0; max-width: 360px;">
    {#each attachments as file (file.name)}
      <li><FileCard layout="row" {...file} onremove={() => {}} /></li>
    {/each}
  </ul>
</Story>

<Story name="Tile grid" asChild>
  <ul style="display: flex; flex-wrap: wrap; gap: 0.75rem; list-style: none; padding: 0; margin: 0;">
    {#each attachments as file (file.name)}
      <li><FileCard {...file} onopen={() => {}} /></li>
    {/each}
  </ul>
</Story>
