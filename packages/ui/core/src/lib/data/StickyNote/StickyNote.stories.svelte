<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import StickyNote from "./StickyNote.svelte";

  const { Story } = defineMeta({
    title: "Data Display/StickyNote",
    component: StickyNote,
    tags: ["autodocs"],
  });
</script>

<Story name="Info">
  <StickyNote variant="info" title="Information">
    <p style="margin: 0;">Gas prices are updated every 15 seconds from the network.</p>
  </StickyNote>
</Story>

<Story name="Warning">
  <StickyNote variant="warning" title="Warning">
    <p style="margin: 0;">This transaction will cost more than 0.1 ETH in gas fees.</p>
  </StickyNote>
</Story>

<Story name="Tip">
  <StickyNote variant="tip" title="Pro Tip">
    <p style="margin: 0;">Use batch transactions to save on gas costs.</p>
  </StickyNote>
</Story>

<Story name="Note">
  <StickyNote variant="note" title="Note">
    <p style="margin: 0;">This feature is available on Ethereum and Polygon networks.</p>
  </StickyNote>
</Story>

<Story name="AllVariants">
  <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 500px;">
    <StickyNote variant="info" title="Info">
      <p style="margin: 0;">Informational callout content.</p>
    </StickyNote>
    <StickyNote variant="warning" title="Warning">
      <p style="margin: 0;">Warning callout content.</p>
    </StickyNote>
    <StickyNote variant="tip" title="Tip">
      <p style="margin: 0;">Tip callout content.</p>
    </StickyNote>
    <StickyNote variant="note" title="Note">
      <p style="margin: 0;">Note callout content.</p>
    </StickyNote>
  </div>
</Story>
