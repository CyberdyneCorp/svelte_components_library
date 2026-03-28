<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ChatPanel from "./ChatPanel.svelte";

  const { Story } = defineMeta({
    title: "Chat/ChatPanel",
    component: ChatPanel,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <div style="height: 400px; display: flex;">
    <ChatPanel>
      <div style="padding: 0.5rem; color: var(--color-text-secondary);">Message 1</div>
      <div style="padding: 0.5rem; color: var(--color-text-secondary);">Message 2</div>
      <div style="padding: 0.5rem; color: var(--color-text-secondary);">Message 3</div>
    </ChatPanel>
  </div>
</Story>
