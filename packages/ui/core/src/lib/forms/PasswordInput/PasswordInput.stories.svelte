<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PasswordInput from "./PasswordInput.svelte";

  const { Story } = defineMeta({
    title: "Forms/PasswordInput",
    component: PasswordInput,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ label: "Password", placeholder: "Enter password..." }} />

<Story name="WithError" args={{ label: "Password", value: "123", error: "Password must be at least 8 characters" }} />
