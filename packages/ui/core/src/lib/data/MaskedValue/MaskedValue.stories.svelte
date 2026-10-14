<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MaskedValue from "./MaskedValue.svelte";

  const { Story } = defineMeta({
    title: "Data/MaskedValue",
    component: MaskedValue,
    tags: ["autodocs"],
    parameters: {
      a11y: { test: "error" },
    },
  });

  // Synthetic secrets for demonstration only.
  const apiKey = "demo_key_EXAMPLE_not_a_secret_7dc1";
</script>

<Story name="Default" args={{ value: apiKey, label: "API key" }} />

<Story name="Revealable and copyable" args={{ value: apiKey, label: "API key", revealable: true, copyable: true }} />

<!-- Re-masks five seconds after it is revealed. -->
<Story name="Auto-hide" args={{ value: apiKey, label: "API key", revealable: true, autoHideAfter: 5000 }} />

<Story name="Card number" args={{ value: "4242424242424242", label: "card number", maskChar: "•", maskLength: 12 }} />

<Story name="Localized" args={{ value: apiKey, label: "chave de API", revealable: true, copyable: true, showLabel: "Mostrar", hideLabel: "Ocultar", copyLabel: "Copiar chave de API", hiddenText: (end: string) => `terminando em ${end}` }} />
