<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import RichTextEditor from "./RichTextEditor.svelte";

  const { Story } = defineMeta({
    title: "Editor/RichTextEditor",
    component: RichTextEditor,
    tags: ["autodocs"],
  });

  const withContentHtml = `<h1>Welcome to the Editor</h1><p>This is a <strong>rich text editor</strong> with full formatting support.</p><h2>Features</h2><ul><li>Bold, italic, and underline text</li><li>Multiple heading levels</li><li>Lists (ordered and unordered)</li></ul><p>Visit <a href="https://example.com">our documentation</a> for more details.</p><blockquote>This is a blockquote for highlighting important information.</blockquote>`;
</script>

<Story name="Default" args={{
  value: "",
  placeholder: "Start writing...",
  height: "300px",
}} />

<Story name="WithContent" args={{
  value: withContentHtml,
  height: "400px",
}} />

<Story name="Readonly" args={{
  value: withContentHtml,
  readonly: true,
  height: "400px",
}} />
