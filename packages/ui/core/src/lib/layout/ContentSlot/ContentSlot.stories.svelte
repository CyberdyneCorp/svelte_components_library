<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ContentSlot from "./ContentSlot.svelte";

  const { Story } = defineMeta({
    title: "Layout/ContentSlot",
    component: ContentSlot,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <ContentSlot name="main">
    <p style="color: var(--color-text-secondary); margin: 0;">Content inside a medium-padded slot.</p>
  </ContentSlot>
</Story>

<Story name="NoPadding">
  <ContentSlot name="hero" padding="none">
    <div style="background: var(--color-state-success-bg); padding: 2rem; color: var(--color-text-secondary);">Full-width content with no slot padding.</div>
  </ContentSlot>
</Story>

<Story name="LargePadding">
  <ContentSlot name="section" padding="lg">
    <p style="color: var(--color-text-secondary); margin: 0;">Content with large padding.</p>
  </ContentSlot>
</Story>
