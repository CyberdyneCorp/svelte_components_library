<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Foundation/Spacing",
    tags: ["autodocs"],
  });
</script>

<script>
  const spacingValues = [
    { token: "--space-1", value: "0.25rem (4px)" },
    { token: "--space-2", value: "0.5rem (8px)" },
    { token: "--space-3", value: "0.75rem (12px)" },
    { token: "--space-4", value: "1rem (16px)" },
    { token: "--space-5", value: "1.25rem (20px)" },
    { token: "--space-6", value: "1.5rem (24px)" },
    { token: "--space-8", value: "2rem (32px)" },
    { token: "--space-10", value: "2.5rem (40px)" },
    { token: "--space-12", value: "3rem (48px)" },
    { token: "--space-16", value: "4rem (64px)" },
  ];
</script>

<Story name="Spacing Scale">
  <div class="spacing-grid">
    {#each spacingValues as { token, value }}
      <div class="spacing-row">
        <span class="spacing-label">{token}</span>
        <div class="spacing-bar" style="width: var({token}); height: 24px; background: var(--color-action-brand-default); border-radius: var(--radius-xs);"></div>
        <span class="spacing-value">{value}</span>
      </div>
    {/each}
  </div>
</Story>

<style>
  .spacing-grid { display: flex; flex-direction: column; gap: 0.75rem; }
  .spacing-row { display: flex; align-items: center; gap: 1rem; }
  .spacing-label { font-family: var(--font-mono); font-size: 0.8rem; color: var(--color-text-tertiary); min-width: 120px; }
  .spacing-value { font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-text-secondary); }
</style>
