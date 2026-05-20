<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ChatResponse from "./ChatResponse.svelte";

  const { Story } = defineMeta({
    title: "Chat/ChatResponse",
    component: ChatResponse,
    tags: ["autodocs"],
  });
</script>

<Story name="UserMessage" args={{ role: "user", content: "How do I connect my wallet?", timestamp: "2:34 PM" }} />

<Story name="AssistantMessage" args={{ role: "assistant", content: "You can connect your wallet by clicking the Connect button in the top right corner.", timestamp: "2:34 PM" }} />

<Story name="SystemMessage" args={{ role: "system", content: "Session started", timestamp: "2:30 PM" }} />

<Story name="AllRoles">
  <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 600px;">
    <ChatResponse role="system" content="Chat session started" />
    <ChatResponse role="assistant" content="Hello! How can I help you today?" timestamp="2:30 PM" />
    <ChatResponse role="user" content="What's the current gas price?" timestamp="2:31 PM" />
    <ChatResponse role="assistant" content="The current gas price is approximately 25 gwei on Ethereum mainnet." timestamp="2:31 PM" />
  </div>
</Story>

<Story name="WithImageAttachment">
  <div style="max-width: 600px;">
    <ChatResponse
      role="assistant"
      content="Here's the elevation profile you asked about — the ridge peaks near km 4."
      timestamp="2:32 PM"
      attachments={[
        { kind: "image", url: "https://placehold.co/400x180/00ff41/000.png", title: "elevation-profile.png" }
      ]}
    />
  </div>
</Story>

<Story name="WithDownloadAttachment">
  <div style="max-width: 600px;">
    <ChatResponse
      role="assistant"
      content="Report exported."
      timestamp="2:35 PM"
      attachments={[
        { kind: "file", url: "#", filename: "portfolio-q4.pdf", byteSize: 4380000, producedBy: "report-generator" }
      ]}
    />
  </div>
</Story>

<Story name="WithToolCalls">
  <div style="max-width: 600px;">
    <ChatResponse
      role="assistant"
      content="I queried the indices and pulled the latest payouts."
      timestamp="2:40 PM"
      toolCalls={[
        { name: "search_indices", argumentsPreview: { region: "EU" }, status: "ok" },
        { name: "fetch_payouts", argumentsPreview: { since: "2026-01-01" }, status: "ok" },
        { name: "geocode", argumentsPreview: { q: "Lisbon" }, status: "running" }
      ]}
    />
  </div>
</Story>

<Story name="Streaming">
  <div style="max-width: 600px;">
    <ChatResponse
      role="assistant"
      content="Streaming response in progress…"
      streaming={true}
    />
  </div>
</Story>

<Story name="WithError">
  <div style="max-width: 600px;">
    <ChatResponse
      role="assistant"
      content="I couldn't reach the tool service."
      error="Connection timeout (504) after 30s."
    />
  </div>
</Story>
