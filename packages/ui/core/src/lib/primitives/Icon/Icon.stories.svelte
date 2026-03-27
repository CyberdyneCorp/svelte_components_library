<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Icon from "./Icon.svelte";

  const { Story } = defineMeta({
    title: "Primitives/Icon",
    component: Icon,
    tags: ["autodocs"],
  });
</script>

<script>
  const allIcons = [
    "check", "x", "chevron-down", "chevron-right", "chevron-left",
    "search", "alert-circle", "info", "settings", "menu",
    "plus", "minus", "copy", "external-link", "terminal",
    "cpu", "shield", "zap", "activity", "lock",
  ];
</script>

<Story name="AllIcons">
  <div class="icon-grid">
    {#each allIcons as name}
      <div class="icon-cell">
        <Icon {name} size={24} color="var(--color-text-primary)" />
        <span class="icon-label">{name}</span>
      </div>
    {/each}
  </div>
</Story>

<Story name="Sizes">
  <div style="display: flex; align-items: center; gap: 1.5rem;">
    <Icon name="zap" size={14} color="var(--color-text-primary)" />
    <Icon name="zap" size={20} color="var(--color-text-primary)" />
    <Icon name="zap" size={28} color="var(--color-text-primary)" />
    <Icon name="zap" size={36} color="var(--color-text-primary)" />
    <Icon name="zap" size={48} color="var(--color-text-primary)" />
  </div>
</Story>

<Story name="CustomColor">
  <div style="display: flex; align-items: center; gap: 1.5rem;">
    <Icon name="shield" size={28} color="var(--primitive-green-10)" />
    <Icon name="activity" size={28} color="var(--primitive-cyan-10)" />
    <Icon name="alert-circle" size={28} color="var(--primitive-red-10)" />
    <Icon name="zap" size={28} color="var(--primitive-amber-10)" />
    <Icon name="cpu" size={28} color="var(--primitive-violet-10)" />
  </div>
</Story>

<style>
  .icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 1rem;
  }

  .icon-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 0.5rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-subtle);
    background: var(--color-surface-default);
  }

  .icon-label {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    color: var(--color-text-tertiary);
    text-align: center;
  }
</style>
