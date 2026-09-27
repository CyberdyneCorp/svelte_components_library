<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import "../lib/themes/calm.css";

  const { Story } = defineMeta({
    title: "Design Tokens/Themes",
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            'Calm theme preset (`@cyberdynecorp/svelte-ui-foundation/themes/calm.css`). Each panel sets `data-theme` on its own element, so both themes render side by side regardless of the toolbar theme.',
        },
      },
    },
  });
</script>

<script>
  const groups = [
    {
      title: "Backgrounds & surfaces",
      tokens: [
        "--color-bg-primary",
        "--color-bg-secondary",
        "--color-bg-tertiary",
        "--color-surface-default",
        "--color-surface-raised",
        "--color-surface-hover",
      ],
    },
    {
      title: "Text",
      tokens: [
        "--color-text-primary",
        "--color-text-secondary",
        "--color-text-tertiary",
        "--color-text-link",
      ],
    },
    {
      title: "Actions",
      tokens: [
        "--color-action-brand-default",
        "--color-action-secondary-default",
        "--color-action-tertiary-default",
        "--color-action-danger-default",
      ],
    },
    {
      title: "State",
      tokens: [
        "--color-state-success",
        "--color-state-warning",
        "--color-state-error",
        "--color-state-info",
      ],
    },
    {
      title: "Borders",
      tokens: ["--color-border-default", "--color-border-strong", "--color-border-focus"],
    },
  ];

  const states = ["success", "warning", "error", "info"];
</script>

{#snippet panel(theme, label)}
  <section class="panel" data-theme={theme} aria-label="{label} theme preview">
    <h3 class="panel-title">{label} <code>data-theme="{theme}"</code></h3>

    <div class="sample">
      <p class="sample-text">
        Primary text, <span class="secondary">secondary text</span>,
        <span class="tertiary">tertiary text</span> and <a href="#top">a link</a>.
      </p>
      <div class="sample-row">
        <span class="btn btn-brand">Brand</span>
        <span class="btn btn-secondary">Secondary</span>
        <span class="btn btn-danger">Danger</span>
        <span class="input">Placeholder</span>
      </div>
      <div class="sample-row">
        {#each states as state (state)}
          <span
            class="chip"
            style="color: var(--color-state-{state}); background: var(--color-state-{state}-bg)"
          >
            {state}
          </span>
        {/each}
      </div>
    </div>

    {#each groups as group (group.title)}
      <h4 class="group-title">{group.title}</h4>
      <div class="swatches">
        {#each group.tokens as token (token)}
          <div class="swatch-container">
            <div class="swatch" style="background: var({token})"></div>
            <code class="swatch-label">{token}</code>
          </div>
        {/each}
      </div>
    {/each}
  </section>
{/snippet}

<Story name="Calm Preset">
  <div class="themes">
    {@render panel("calm", "Calm")}
    {@render panel("calm-dark", "Calm dark")}
  </div>
</Story>

<Story name="Calm">
  {@render panel("calm", "Calm")}
</Story>

<Story name="Calm Dark">
  {@render panel("calm-dark", "Calm dark")}
</Story>

<style>
  .themes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: var(--space-4);
  }

  .panel {
    padding: var(--space-6);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-subtle);
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    font-family: var(--font-body);
  }

  .panel-title {
    margin: 0 0 var(--space-4);
    font-family: var(--font-display);
    font-size: 1.125rem;
  }

  .panel-title code,
  .swatch-label {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  .sample {
    padding: var(--space-4);
    border-radius: var(--radius-lg);
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    box-shadow: var(--shadow-sm);
  }

  .sample-text {
    margin: 0 0 var(--space-3);
  }

  .secondary {
    color: var(--color-text-secondary);
  }

  .tertiary {
    color: var(--color-text-tertiary);
  }

  .sample a {
    color: var(--color-text-link);
  }

  .sample-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: var(--space-2);
  }

  .btn,
  .input,
  .chip {
    display: inline-flex;
    align-items: center;
    padding: var(--space-1) var(--space-3);
    font-size: 0.875rem;
  }

  .btn {
    border-radius: var(--radius-md);
    border: 1px solid transparent;
  }

  .btn-brand {
    background: var(--btn-brand-bg);
    color: var(--btn-brand-text);
  }

  .btn-secondary {
    background: var(--btn-secondary-bg);
    color: var(--btn-secondary-text);
    border-color: var(--btn-secondary-border);
  }

  .btn-danger {
    background: var(--btn-danger-bg);
    color: var(--btn-danger-text);
  }

  .input {
    min-width: 8rem;
    border-radius: var(--radius-md);
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    color: var(--input-placeholder);
  }

  .chip {
    border-radius: var(--radius-pill);
    text-transform: capitalize;
  }

  .group-title {
    margin: var(--space-6) 0 var(--space-2);
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  .swatches {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: var(--space-3);
  }

  .swatch {
    height: 40px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border-default);
  }

  .swatch-label {
    display: block;
    margin-top: var(--space-1);
    word-break: break-all;
  }
</style>
