<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import DiffViewer from "./DiffViewer.svelte";

  const { Story } = defineMeta({
    title: "Data Display/DiffViewer",
    component: DiffViewer,
    tags: ["autodocs"],
  });

  const codeOld = `export function processData(input: string): Result {
  const parsed = JSON.parse(input);
  const filtered = parsed.filter(Boolean);
  return {
    data: filtered,
    count: filtered.length,
  };
}`;

  const codeNew = `export async function processData(
  input: string,
  options?: ProcessOptions,
): Promise<Result> {
  const parsed = JSON.parse(input);
  const filtered = parsed.filter(Boolean);
  const validated = filtered.map(validate);
  return {
    data: validated,
    count: validated.length,
    timestamp: Date.now(),
  };
}`;

  const configOld = `{
  "name": "cyberdyne-ui",
  "version": "1.2.0",
  "private": true,
  "scripts": {
    "dev": "vite dev",
    "build": "vite build"
  }
}`;

  const configNew = `{
  "name": "cyberdyne-ui",
  "version": "1.3.0",
  "private": true,
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "test": "vitest run",
    "lint": "eslint ."
  },
  "type": "module"
}`;
</script>

<Story
  name="CodeDiff"
  args={{
    oldText: codeOld,
    newText: codeNew,
    language: "TypeScript",
    oldLabel: "v1.2.0",
    newLabel: "v1.3.0",
  }}
/>

<Story
  name="ConfigDiff"
  args={{
    oldText: configOld,
    newText: configNew,
    language: "JSON",
    oldLabel: "Before",
    newLabel: "After",
  }}
/>

<Story
  name="Unified"
  args={{
    oldText: codeOld,
    newText: codeNew,
    language: "TypeScript",
    mode: "unified",
    oldLabel: "v1.2.0",
    newLabel: "v1.3.0",
  }}
/>
