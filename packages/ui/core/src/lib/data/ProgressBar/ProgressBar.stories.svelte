<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ProgressBar from "./ProgressBar.svelte";

  const { Story } = defineMeta({
    title: "Data Display/ProgressBar",
    component: ProgressBar,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ value: 65 }} />

<Story name="Variants">
  <div style="width: 400px; display: flex; flex-direction: column; gap: 1.5rem;">
    <div>
      <span style="color: var(--color-text-secondary); font-size: 0.75rem; font-family: var(--font-body); display: block; margin-bottom: 0.25rem;">Brand</span>
      <ProgressBar value={75} variant="brand" />
    </div>
    <div>
      <span style="color: var(--color-text-secondary); font-size: 0.75rem; font-family: var(--font-body); display: block; margin-bottom: 0.25rem;">Info</span>
      <ProgressBar value={60} variant="info" />
    </div>
    <div>
      <span style="color: var(--color-text-secondary); font-size: 0.75rem; font-family: var(--font-body); display: block; margin-bottom: 0.25rem;">Warning</span>
      <ProgressBar value={45} variant="warning" />
    </div>
    <div>
      <span style="color: var(--color-text-secondary); font-size: 0.75rem; font-family: var(--font-body); display: block; margin-bottom: 0.25rem;">Error</span>
      <ProgressBar value={90} variant="error" />
    </div>
  </div>
</Story>

<Story name="WithLabel">
  <div style="width: 400px; display: flex; flex-direction: column; gap: 1rem;">
    <ProgressBar value={42} variant="brand" showLabel />
    <ProgressBar value={100} variant="brand" showLabel size="sm" />
  </div>
</Story>
