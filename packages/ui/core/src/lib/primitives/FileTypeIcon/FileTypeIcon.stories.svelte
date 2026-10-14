<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FileTypeIcon from "./FileTypeIcon.svelte";

  const { Story } = defineMeta({
    title: "Primitives/FileTypeIcon",
    component: FileTypeIcon,
    tags: ["autodocs"],
    parameters: {
      a11y: { test: "error" },
    },
    argTypes: {
      size: { control: { type: "range", min: 16, max: 96, step: 4 } },
    },
  });

  const samples = [
    "report.pdf",
    "notes.docx",
    "budget.xlsx",
    "deck.pptx",
    "photo.jpeg",
    "voice.m4a",
    "demo.mp4",
    "backup.tar.gz",
    "App.svelte",
    "data.bin",
    "README",
  ];
</script>

<Story name="Default" args={{ fileName: "invoice.pdf", size: 48, label: "PDF file" }} />

<!-- One per category, plus an unknown extension and a file without one. -->
<Story name="Categories" asChild>
  <ul style="display: flex; flex-wrap: wrap; gap: 1rem; list-style: none; padding: 0; margin: 0;">
    {#each samples as name (name)}
      <li style="display: grid; justify-items: center; gap: 0.25rem; font-size: 0.75rem;">
        <FileTypeIcon fileName={name} size={40} />
        <span>{name}</span>
      </li>
    {/each}
  </ul>
</Story>

<Story name="Sizes" asChild>
  <div style="display: flex; align-items: end; gap: 1rem;">
    <FileTypeIcon type="csv" size={16} />
    <FileTypeIcon type="csv" size={24} />
    <FileTypeIcon type="csv" size={40} />
    <FileTypeIcon type="csv" size={64} />
  </div>
</Story>
