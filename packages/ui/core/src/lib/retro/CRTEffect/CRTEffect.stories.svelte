<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CRTEffect from "./CRTEffect.svelte";
  const { Story } = defineMeta({ title: "Retro/CRTEffect", component: CRTEffect, tags: ["autodocs"] });
</script>

<Story name="Default">
  {#snippet children()}
    <CRTEffect>
      <div style="width: 400px; height: 220px; background: #000; color: #00ff41; padding: 20px; font-family: monospace;">
        CyberdyneOS terminal output...
      </div>
    </CRTEffect>
  {/snippet}
</Story>

<Story name="Flicker">
  {#snippet children()}
    <CRTEffect flicker intensity={0.25}>
      <div style="width: 400px; height: 220px; background: #0a0a1a; color: #00ff41; padding: 20px; font-family: monospace;">
        Signal strength: nominal
      </div>
    </CRTEffect>
  {/snippet}
</Story>
