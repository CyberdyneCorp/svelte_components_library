<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Design Tokens/Colors",
    tags: ["autodocs"],
  });
</script>

<script>
  const palettes = [
    {
      name: "Neon Green (Brand Primary)",
      prefix: "--primitive-green",
      shades: [10, 20, 30, 40, 50, 60],
    },
    {
      name: "Electric Cyan (Secondary)",
      prefix: "--primitive-cyan",
      shades: [10, 20, 30, 40, 50, 60],
    },
    {
      name: "Violet (Tertiary)",
      prefix: "--primitive-violet",
      shades: [10, 20, 30, 40, 50, 60],
    },
    {
      name: "Red (Danger)",
      prefix: "--primitive-red",
      shades: [10, 20, 30, 40, 50, 60],
    },
    {
      name: "Amber (Warning)",
      prefix: "--primitive-amber",
      shades: [10, 20, 30, 40, 50, 60],
    },
    {
      name: "Grey Scale",
      prefix: "--primitive-grey",
      shades: [5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110],
    },
  ];
</script>

<Story name="Primitive Colors">
  <div class="color-grid">
    {#each palettes as palette}
      <div class="palette">
        <h3 class="palette-title">{palette.name}</h3>
        <div class="swatches">
          {#each palette.shades as shade}
            <div class="swatch-container">
              <div
                class="swatch"
                style="background: var({palette.prefix}-{shade})"
              ></div>
              <span class="swatch-label">{palette.prefix}-{shade}</span>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</Story>

<Story name="Semantic Colors">
  <div class="semantic-grid">
    <div class="semantic-section">
      <h3>Backgrounds</h3>
      {#each ["primary", "secondary", "tertiary", "elevated"] as variant}
        <div class="semantic-row">
          <div class="swatch" style="background: var(--color-bg-{variant}); border: 1px solid var(--color-border-default)"></div>
          <span>--color-bg-{variant}</span>
        </div>
      {/each}
    </div>
    <div class="semantic-section">
      <h3>Text</h3>
      {#each ["primary", "secondary", "tertiary", "disabled", "link", "code"] as variant}
        <div class="semantic-row">
          <span class="text-sample" style="color: var(--color-text-{variant})">Aa — --color-text-{variant}</span>
        </div>
      {/each}
    </div>
    <div class="semantic-section">
      <h3>State</h3>
      {#each [
        { name: "success", color: "--color-state-success", bg: "--color-state-success-bg" },
        { name: "warning", color: "--color-state-warning", bg: "--color-state-warning-bg" },
        { name: "error", color: "--color-state-error", bg: "--color-state-error-bg" },
        { name: "info", color: "--color-state-info", bg: "--color-state-info-bg" },
      ] as state}
        <div class="state-pill" style="background: var({state.bg}); color: var({state.color}); border: 1px solid var({state.color})">
          {state.name}
        </div>
      {/each}
    </div>
  </div>
</Story>

<style>
  .color-grid { display: flex; flex-direction: column; gap: 2rem; }
  .palette-title { font-family: var(--font-display); color: var(--color-text-primary); margin-bottom: 0.75rem; font-size: 1.1rem; }
  .swatches { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .swatch-container { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
  .swatch { width: 64px; height: 64px; border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.05); }
  .swatch-label { font-family: var(--font-mono); font-size: 0.625rem; color: var(--color-text-tertiary); text-align: center; max-width: 72px; word-break: break-all; }
  .semantic-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
  .semantic-section h3 { font-family: var(--font-display); color: var(--color-text-primary); margin-bottom: 0.75rem; }
  .semantic-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
  .semantic-row .swatch { width: 40px; height: 40px; border-radius: var(--radius-sm); flex-shrink: 0; }
  .semantic-row span { font-family: var(--font-mono); font-size: 0.8rem; color: var(--color-text-secondary); }
  .text-sample { font-size: 1rem; font-family: var(--font-body); }
  .state-pill { display: inline-block; padding: 0.25rem 0.75rem; border-radius: var(--radius-pill); font-family: var(--font-mono); font-size: 0.8rem; margin-right: 0.5rem; margin-bottom: 0.5rem; }
</style>
