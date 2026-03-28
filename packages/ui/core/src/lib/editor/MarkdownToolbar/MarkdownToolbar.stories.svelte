<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MarkdownToolbar from "./MarkdownToolbar.svelte";

  const { Story } = defineMeta({
    title: "Editor/MarkdownToolbar",
    component: MarkdownToolbar,
    tags: ["autodocs"],
  });
</script>

<script>
  let textareaEl = $state(null);
</script>

<Story name="Default">
  <div style="background: var(--color-bg-primary); border: 1px solid var(--color-border-subtle); border-radius: 8px; overflow: hidden;">
    <MarkdownToolbar bind:textarea={textareaEl} oninsert={(text) => {}} />
    <textarea
      bind:this={textareaEl}
      style="width: 100%; min-height: 200px; background: var(--color-surface-default); color: var(--color-text-primary); border: none; padding: 1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.875rem; resize: vertical; box-sizing: border-box; outline: none;"
      placeholder="Click toolbar buttons to insert markdown..."
    ></textarea>
  </div>
</Story>
