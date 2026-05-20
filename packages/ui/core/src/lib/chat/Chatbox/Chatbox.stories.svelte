<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Chatbox from "./Chatbox.svelte";

  const { Story } = defineMeta({
    title: "Chat/Chatbox",
    component: Chatbox,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ onsend: (msg, files) => console.log("Send:", msg, files), onattach: (files) => console.log("Attached:", files) }} />

<Story name="WithPlaceholder" args={{ placeholder: "Ask me anything...", onsend: (msg) => console.log(msg) }} />

<Story name="WithImageAttachOnly" args={{
  showAttach: true,
  acceptTypes: "image/*",
  multiple: true,
  onsend: (msg, files) => console.log("Send:", msg, files.map(f => f.name)),
  onattach: (files) => console.log("Image picked:", files.map(f => f.name))
}} />

<Story name="WithFileSizeLimit" args={{
  showAttach: true,
  multiple: true,
  maxSizeBytes: 5_000_000,
  onsend: (msg, files) => console.log("Send:", msg, files),
  onattach: (files) => console.log("Attached:", files),
  onerror: (msg, rejected) => console.warn("Rejected:", msg, rejected.map(f => f.name))
}} />

<Story name="Disabled" args={{ disabled: true, value: "Cannot type here" }} />

<Story name="Loading" args={{ loading: true, value: "Sending message..." }} />
