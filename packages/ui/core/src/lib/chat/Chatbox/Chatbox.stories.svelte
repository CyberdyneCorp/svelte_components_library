<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Chatbox from "./Chatbox.svelte";

  const { Story } = defineMeta({
    title: "Chat/Chatbox",
    component: Chatbox,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ onsend: (msg) => console.log("Send:", msg), onattach: () => console.log("Attach") }} />

<Story name="WithPlaceholder" args={{ placeholder: "Ask me anything...", onsend: (msg) => console.log(msg) }} />

<Story name="Disabled" args={{ disabled: true, value: "Cannot type here" }} />

<Story name="Loading" args={{ loading: true, value: "Sending message..." }} />
