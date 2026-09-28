<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import "../lib/themes/calm.css";
  import "../lib/themes/minimal.css";
  import "../lib/themes/flat.css";
  import "../lib/themes/material.css";
  import "../lib/themes/swiss.css";
  import "../lib/themes/organic.css";
  import "../lib/themes/maximalism.css";
  import "../lib/themes/y2k.css";
  import "../lib/themes/glass.css";
  import "../lib/themes/neumorphism.css";
  import "../lib/themes/skeuomorphism.css";
  import "../lib/themes/brutalism.css";
  import "../lib/themes/bento.css";
  import "../lib/themes/clay.css";
  import "../lib/themes/memphis.css";
  import "../lib/themes/vaporwave.css";
  import "../lib/themes/art-deco.css";
  import "../lib/themes/editorial.css";

  const { Story } = defineMeta({
    title: "Design Tokens/Themes",
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Theme presets (`@cyberdynecorp/svelte-ui-foundation/themes/<id>.css`): calm and the 17 design-style presets. Each panel sets `data-theme` on its own element, so presets render side by side regardless of the toolbar theme. Use the toolbar Theme menu to preview any real component in a preset.",
        },
      },
    },
  });
</script>

<script>
  /** Design-style presets: id, label and the style each one expresses. */
  const styles = [
    { id: "minimal", label: "Minimal", note: "whitespace, greys, hairlines" },
    { id: "flat", label: "Flat", note: "solid colour, no depth" },
    { id: "material", label: "Material", note: "tonal surfaces, elevation" },
    { id: "swiss", label: "Swiss", note: "grid, black / white / red, square" },
    { id: "organic", label: "Organic", note: "earth tones, grain, soft shapes" },
    { id: "maximalism", label: "Maximalism", note: "loud colour, hard shadows" },
    { id: "y2k", label: "Y2K", note: "chrome sheen, glossy bubbles" },
    { id: "glass", label: "Glass", note: "tinted glass panels over an aurora" },
    { id: "neumorphism", label: "Neumorphism", note: "soft extruded shadows" },
    { id: "skeuomorphism", label: "Skeuomorphism", note: "leather, paper, bevels" },
    { id: "brutalism", label: "Brutalism", note: "thick black borders, offsets" },
    { id: "bento", label: "Bento", note: "rounded tiles, calm grid" },
    { id: "clay", label: "Clay", note: "puffy pastel, inner shadows" },
    { id: "memphis", label: "Memphis", note: "confetti, bold outlines" },
    { id: "vaporwave", label: "Vaporwave", note: "neon grid, sunset gradient" },
    { id: "art-deco", label: "Art Deco", note: "gold on black, double rules" },
    { id: "editorial", label: "Editorial", note: "serif type, paper, rules" },
  ];

  let selected = $state("brutalism");
  const current = $derived(styles.find((s) => s.id === selected) ?? styles[0]);

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

{#snippet preview(theme, label, note)}
  <section class="style-panel" data-theme={theme} aria-label="{label} style preview">
    <header class="style-head">
      <h3 class="style-title">{label}</h3>
      <code class="style-id">data-theme="{theme}"</code>
    </header>
    {#if note}<p class="style-note">{note}</p>{/if}

    <div class="style-card">
      <h4 class="style-card-title">Quarterly revenue</h4>
      <p class="style-card-body">
        Up 12% on last quarter. <span class="secondary">Updated 5 minutes ago</span> ·
        <a href="#top">View report</a>
      </p>
      <div class="sample-row">
        <span class="s-btn s-btn-brand">Save</span>
        <span class="s-btn s-btn-secondary">Cancel</span>
        <span class="s-btn s-btn-danger">Delete</span>
      </div>
      <div class="sample-row">
        <span class="s-input">Search…</span>
      </div>
      <div class="sample-row">
        {#each states as state (state)}
          <span
            class="s-badge"
            style="color: var(--color-state-{state}); background: var(--color-state-{state}-bg)"
          >
            {state}
          </span>
        {/each}
      </div>
      <div class="s-tabs" role="presentation">
        <span class="s-tab s-tab-active">Overview</span>
        <span class="s-tab">Activity</span>
        <span class="s-tab">Settings</span>
      </div>
      <div class="accents" aria-hidden="true">
        {#each [1, 2, 3, 4] as n (n)}
          <span class="accent" style="background: var(--color-accent-{n})"></span>
        {/each}
      </div>
    </div>
  </section>
{/snippet}

<Story name="Style Switcher">
  <div class="switcher" role="radiogroup" aria-label="Design style">
    {#each styles as style (style.id)}
      <label class="switch-option" class:active={style.id === selected}>
        <input type="radio" name="design-style" value={style.id} bind:group={selected} />
        {style.label}
      </label>
    {/each}
  </div>
  <div class="style-backdrop" data-theme={current.id}>
    {@render preview(current.id, current.label, current.note)}
  </div>
</Story>

<Story name="Style Gallery">
  <div class="gallery">
    {#each styles as style (style.id)}
      <div class="style-backdrop" data-theme={style.id}>
        {@render preview(style.id, style.label, style.note)}
      </div>
    {/each}
  </div>
</Story>

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
  .switcher {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
  }

  .switch-option {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-pill);
    font-size: 0.8125rem;
    cursor: pointer;
  }

  .switch-option.active {
    border-color: var(--color-border-focus);
    color: var(--color-text-link);
  }

  .switch-option input {
    accent-color: var(--color-border-focus);
  }

  .gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: var(--space-4);
  }

  .style-backdrop {
    padding: var(--space-5);
    border-radius: var(--radius-lg);
    background: var(--pattern-backdrop), var(--gradient-backdrop), var(--color-bg-primary);
    color: var(--color-text-primary);
    font-family: var(--font-body);
  }

  .style-panel {
    display: grid;
    gap: var(--space-3);
  }

  .style-head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .style-title,
  .style-card-title {
    margin: 0;
    font-family: var(--font-decorative);
    text-transform: var(--heading-transform);
  }

  .style-title {
    font-size: 1.25rem;
  }

  .style-id {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  .style-note {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  /* Mirrors Card: surface layers, offset/raised shadows, border shape. */
  .style-card {
    padding: var(--space-4);
    border-radius: var(--radius-lg);
    background: var(--texture-surface), var(--gradient-surface), var(--card-bg);
    border: var(--border-width) var(--border-style) var(--card-border);
    box-shadow: var(--shadow-offset), var(--shadow-raised);
  }

  .style-card-title {
    font-size: 1rem;
    margin-bottom: var(--space-2);
  }

  .style-card-body {
    margin: 0 0 var(--space-2);
    font-size: 0.875rem;
  }

  .style-card-body a {
    color: var(--color-text-link);
  }

  /* Mirrors Button. */
  .s-btn {
    display: inline-flex;
    align-items: center;
    padding: var(--space-1) var(--space-3);
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: var(--radius-md);
    border: var(--border-width) var(--border-style) transparent;
    box-shadow: var(--shadow-offset), var(--shadow-raised);
  }

  .s-btn-brand {
    background: var(--gradient-brand), var(--btn-brand-bg);
    color: var(--btn-brand-text);
  }

  .s-btn-secondary {
    background: var(--texture-surface), var(--gradient-surface), var(--btn-secondary-bg);
    color: var(--btn-secondary-text);
    border-color: var(--btn-secondary-border);
  }

  .s-btn-danger {
    background: var(--btn-danger-bg);
    color: var(--btn-danger-text);
  }

  /* Mirrors TextInput. */
  .s-input {
    flex: 1;
    min-width: 8rem;
    padding: var(--space-2) var(--space-3);
    font-size: 0.875rem;
    border-radius: var(--radius-md);
    background: var(--input-bg);
    border: var(--border-width) var(--border-style) var(--input-border);
    box-shadow: var(--shadow-inset);
    color: var(--input-placeholder);
  }

  .s-badge {
    padding: 0.125rem var(--space-2);
    font-size: 0.75rem;
    border-radius: var(--radius-pill);
    text-transform: capitalize;
  }

  /* Mirrors Tabs: strong indicator under the active tab. */
  .s-tabs {
    display: flex;
    gap: var(--space-3);
    margin-top: var(--space-3);
    border-bottom: var(--border-width) var(--border-style) var(--color-border-default);
  }

  .s-tab {
    padding: var(--space-1) 0;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  .s-tab-active {
    color: var(--color-text-primary);
    border-bottom: var(--border-width-strong) solid var(--color-border-brand);
    margin-bottom: calc(-1 * var(--border-width));
  }

  .accents {
    display: flex;
    gap: var(--space-2);
    margin-top: var(--space-3);
  }

  .accent {
    width: 1.5rem;
    height: 0.5rem;
    border-radius: var(--radius-pill);
  }

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
