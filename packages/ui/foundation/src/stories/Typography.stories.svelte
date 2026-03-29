<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Design Tokens/Typography",
    tags: ["autodocs"],
  });
</script>

<Story name="Type Scale">
  <div class="type-showcase">
    <div class="type-row">
      <span class="type-label">Display 1</span>
      <span class="cy-type-display-1">Cyberdyne Systems</span>
    </div>
    <div class="type-row">
      <span class="type-label">Display 2</span>
      <span class="cy-type-display-2">Neural Network Interface</span>
    </div>
    <div class="type-row">
      <span class="type-label">Heading 1</span>
      <span class="cy-type-h1">Blockchain Protocol Engine</span>
    </div>
    <div class="type-row">
      <span class="type-label">Heading 2</span>
      <span class="cy-type-h2">Machine Learning Pipeline</span>
    </div>
    <div class="type-row">
      <span class="type-label">Heading 3</span>
      <span class="cy-type-h3">Research & Development</span>
    </div>
    <div class="type-row">
      <span class="type-label">Body Large</span>
      <span class="cy-type-body-lg">Building the future of decentralized intelligence.</span>
    </div>
    <div class="type-row">
      <span class="type-label">Body Medium</span>
      <span class="cy-type-body-md">Our platform integrates cutting-edge ML models with blockchain infrastructure.</span>
    </div>
    <div class="type-row">
      <span class="type-label">Body Small</span>
      <span class="cy-type-body-sm">Deployed across 40+ validator nodes with 99.99% uptime.</span>
    </div>
    <div class="type-row">
      <span class="type-label">Label</span>
      <span class="cy-type-label">Transaction Status</span>
    </div>
    <div class="type-row">
      <span class="type-label">Caption</span>
      <span class="cy-type-caption">Last updated 2 minutes ago · Block #18,234,891</span>
    </div>
    <div class="type-row">
      <span class="type-label">Code</span>
      <span class="cy-type-code">const tx = await contract.execute(params);</span>
    </div>
  </div>
</Story>

<Story name="Font Families">
  <div class="font-showcase">
    <div class="font-row">
      <span class="font-label">Display</span>
      <span style="font-family: var(--font-display); font-size: 1.5rem; color: var(--color-text-primary)">
        Space Grotesk — ABCDEFGabcdefg 0123456789
      </span>
    </div>
    <div class="font-row">
      <span class="font-label">Body</span>
      <span style="font-family: var(--font-body); font-size: 1.25rem; color: var(--color-text-primary)">
        Inter — ABCDEFGabcdefg 0123456789
      </span>
    </div>
    <div class="font-row">
      <span class="font-label">Mono</span>
      <span style="font-family: var(--font-mono); font-size: 1.25rem; color: var(--color-text-code)">
        JetBrains Mono — ABCDEFGabcdefg 0123456789
      </span>
    </div>
  </div>
</Story>

<style>
  .type-showcase { display: flex; flex-direction: column; gap: 1.5rem; }
  .type-row { display: flex; flex-direction: column; gap: 0.25rem; padding-bottom: 1rem; border-bottom: 1px solid var(--color-border-subtle); }
  .type-label { font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.1em; }
  .font-showcase { display: flex; flex-direction: column; gap: 2rem; }
  .font-row { display: flex; flex-direction: column; gap: 0.5rem; }
  .font-label { font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.1em; }
</style>
