<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PasswordInput from "./PasswordInput.svelte";

  const { Story } = defineMeta({
    title: "Forms/PasswordInput",
    component: PasswordInput,
    tags: ["autodocs"],
    parameters: {
      a11y: { test: "error" },
    },
  });

  // Demo only: the application supplies the generator; the library never generates passwords.
  const alphabet = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789-_";
  function demoGenerate() {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  }
</script>

<Story name="Default" args={{ label: "Password", placeholder: "Enter password..." }} />

<Story
  name="WithError"
  args={{ label: "Password", value: "123", error: "Password must be at least 8 characters" }}
/>

<Story
  name="WithGenerate"
  args={{
    label: "Root password",
    name: "root_password",
    autocomplete: "new-password",
    placeholder: "Choose or generate a password",
    ongenerate: demoGenerate,
  }}
/>

<Story
  name="Translated"
  args={{
    label: "Senha root",
    name: "root_password",
    autocomplete: "new-password",
    generateLabel: "Gerar",
    showLabel: "Mostrar senha",
    hideLabel: "Ocultar senha",
    ongenerate: demoGenerate,
  }}
/>

<Story
  name="LoginAutocomplete"
  args={{
    label: "Password",
    id: "login-password",
    name: "password",
    autocomplete: "current-password",
  }}
/>
