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
  <div style="background: #0a0a0f; border: 1px solid rgba(0, 255, 65, 0.15); border-radius: 8px; overflow: hidden;">
    <MarkdownToolbar bind:textarea={textareaEl} oninsert={(text) => {}} />
    <textarea
      bind:this={textareaEl}
      style="width: 100%; min-height: 200px; background: #12121a; color: #f0f0ff; border: none; padding: 1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.875rem; resize: vertical; box-sizing: border-box; outline: none;"
      placeholder="Click toolbar buttons to insert markdown..."
    ></textarea>
  </div>
</Story>
