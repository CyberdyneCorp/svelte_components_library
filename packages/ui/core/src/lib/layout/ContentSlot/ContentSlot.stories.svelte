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
    <p style="color: rgba(255,255,255,0.7); margin: 0;">Content inside a medium-padded slot.</p>
  </ContentSlot>
</Story>

<Story name="NoPadding">
  <ContentSlot name="hero" padding="none">
    <div style="background: rgba(0,255,65,0.05); padding: 2rem; color: rgba(255,255,255,0.7);">Full-width content with no slot padding.</div>
  </ContentSlot>
</Story>

<Story name="LargePadding">
  <ContentSlot name="section" padding="lg">
    <p style="color: rgba(255,255,255,0.7); margin: 0;">Content with large padding.</p>
  </ContentSlot>
</Story>
