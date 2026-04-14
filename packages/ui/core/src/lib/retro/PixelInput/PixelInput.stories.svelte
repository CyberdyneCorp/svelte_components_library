<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PixelInput from "./PixelInput.svelte";
  const { Story } = defineMeta({ title: "Retro/PixelInput", component: PixelInput, tags: ["autodocs"] });
</script>

<Story name="Default" args={{ label: "Username", placeholder: "neo" }} />
<Story name="Password" args={{ label: "Password", type: "password", required: true }} />
<Story name="Error" args={{ label: "Email", value: "nope", error: "Invalid email address" }} />
<Story name="Disabled" args={{ label: "Wallet", value: "0xABC...", disabled: true }} />
