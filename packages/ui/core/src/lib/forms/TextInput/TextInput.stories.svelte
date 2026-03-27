<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TextInput from "./TextInput.svelte";

  const { Story } = defineMeta({
    title: "Forms/TextInput",
    component: TextInput,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ placeholder: "Enter text..." }} />

<Story name="WithLabel" args={{ label: "Wallet Address", placeholder: "0x..." }} />

<Story name="WithHint" args={{ label: "API Key", placeholder: "Enter your key", hint: "Found in your dashboard settings" }} />

<Story name="WithError" args={{ label: "Email", value: "not-an-email", error: "Please enter a valid email address" }} />

<Story name="Disabled" args={{ label: "Node ID", value: "node-0x4f2a", disabled: true }} />

<Story name="Types">
  <div style="display: flex; flex-direction: column; gap: 1rem;">
    <TextInput label="Text" type="text" placeholder="Plain text" />
    <TextInput label="Email" type="email" placeholder="user@cyberdyne.io" />
    <TextInput label="URL" type="url" placeholder="https://..." />
    <TextInput label="Number" type="number" placeholder="0" />
  </div>
</Story>
