<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Chatbox from "./Chatbox.svelte";

  const { Story } = defineMeta({
    title: "Chat/Chatbox",
    component: Chatbox,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <Chatbox onsend={(msg) => console.log("Send:", msg)} onattach={() => console.log("Attach")} />
</Story>

<Story name="WithPlaceholder">
  <Chatbox placeholder="Ask me anything..." onsend={(msg) => console.log(msg)} />
</Story>

<Story name="Disabled">
  <Chatbox disabled value="Cannot type here" />
</Story>

<Story name="Loading">
  <Chatbox loading value="Sending message..." />
</Story>
