<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PasswordInput from "./PasswordInput.svelte";

  const { Story } = defineMeta({
    title: "Forms/PasswordInput",
    component: PasswordInput,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <PasswordInput label="Password" placeholder="Enter password..." />
</Story>

<Story name="WithError">
  <PasswordInput label="Password" value="123" error="Password must be at least 8 characters" />
</Story>
