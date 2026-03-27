<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ChatResponse from "./ChatResponse.svelte";

  const { Story } = defineMeta({
    title: "Chat/ChatResponse",
    component: ChatResponse,
    tags: ["autodocs"],
  });
</script>

<Story name="UserMessage">
  <ChatResponse role="user" content="How do I connect my wallet?" timestamp="2:34 PM" />
</Story>

<Story name="AssistantMessage">
  <ChatResponse role="assistant" content="You can connect your wallet by clicking the Connect button in the top right corner." timestamp="2:34 PM" />
</Story>

<Story name="SystemMessage">
  <ChatResponse role="system" content="Session started" timestamp="2:30 PM" />
</Story>

<Story name="AllRoles">
  <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 600px;">
    <ChatResponse role="system" content="Chat session started" />
    <ChatResponse role="assistant" content="Hello! How can I help you today?" timestamp="2:30 PM" />
    <ChatResponse role="user" content="What's the current gas price?" timestamp="2:31 PM" />
    <ChatResponse role="assistant" content="The current gas price is approximately 25 gwei on Ethereum mainnet." timestamp="2:31 PM" />
  </div>
</Story>
