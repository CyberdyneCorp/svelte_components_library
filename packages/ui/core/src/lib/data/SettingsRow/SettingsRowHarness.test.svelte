<svelte:options runes={true} />

<script lang="ts">
  // Test-only harness (the `.test.` infix keeps it out of the published package):
  // SettingsRow with a real Icon and two real Buttons in `actions`.
  import SettingsRow from "./SettingsRow.svelte";
  import Button from "../../primitives/Button/Button.svelte";
  import Icon from "../../primitives/Icon/Icon.svelte";

  let {
    as = "div",
    onreset,
    onadd,
  }: {
    as?: "div" | "li";
    onreset?: () => void;
    onadd?: () => void;
  } = $props();
</script>

<SettingsRow
  {as}
  title="Resolvedores DNS"
  description="Use os padrões ou adicione o seu."
  badge="Personalizado"
  badgeVariant="info"
  data-setting="dns"
>
  {#snippet icon()}
    <Icon name="settings" size={18} />
  {/snippet}
  {#snippet actions()}
    <Button variant="ghost" size="sm" onclick={onreset}>Restaurar padrões</Button>
    <Button variant="secondary" size="sm" onclick={onadd}>Adicionar</Button>
  {/snippet}
</SettingsRow>
