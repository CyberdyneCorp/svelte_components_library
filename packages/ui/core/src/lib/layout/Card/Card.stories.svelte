<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Card from "./Card.svelte";

  const { Story } = defineMeta({
    title: "Layout/Card",
    component: Card,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <Card>
    <h3 style="color: var(--color-text-primary); font-family: var(--font-display); margin-bottom: 0.5rem;">Model Performance</h3>
    <p style="color: var(--color-text-secondary); font-family: var(--font-body); font-size: 0.875rem;">Accuracy: 94.7% | Loss: 0.032</p>
  </Card>
</Story>

<Story name="Elevated">
  <Card variant="elevated">
    <h3 style="color: var(--color-text-primary); font-family: var(--font-display); margin-bottom: 0.5rem;">Wallet Balance</h3>
    <p style="color: var(--color-action-brand-default); font-family: var(--font-mono); font-size: 1.5rem;">3.142 ETH</p>
  </Card>
</Story>

<Story name="Outlined">
  <Card variant="outlined">
    <h3 style="color: var(--color-text-primary); font-family: var(--font-display); margin-bottom: 0.5rem;">Network Stats</h3>
    <p style="color: var(--color-text-secondary); font-family: var(--font-body); font-size: 0.875rem;">14,203 TPS | Block Time: 12s</p>
  </Card>
</Story>

<Story name="Hoverable">
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
    <Card hoverable>
      <h4 style="color: var(--color-text-primary); font-family: var(--font-display);">ETH</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.8rem;">$3,245.12</p>
    </Card>
    <Card hoverable>
      <h4 style="color: var(--color-text-primary); font-family: var(--font-display);">BTC</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.8rem;">$67,891.00</p>
    </Card>
    <Card hoverable>
      <h4 style="color: var(--color-text-primary); font-family: var(--font-display);">SOL</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.8rem;">$142.50</p>
    </Card>
  </div>
</Story>
