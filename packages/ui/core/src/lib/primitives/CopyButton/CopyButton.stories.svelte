<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CopyButton from "./CopyButton.svelte";

  const { Story } = defineMeta({
    title: "Primitives/CopyButton",
    component: CopyButton,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <div style="padding: 1rem; display: flex; align-items: center; gap: 1rem;">
    <code style="
      padding: 0.5rem 1rem;
      background: var(--color-surface-raised);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-md);
      font-family: var(--font-mono);
      font-size: 0.8125rem;
      color: #00ff41;
    ">npm install @cyberdyne/core</code>
    <CopyButton text="npm install @cyberdyne/core" />
  </div>
</Story>

<Story name="WithLabel">
  <div style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <span style="font-family: var(--font-body); font-size: 0.8125rem; color: var(--color-text-tertiary);">API Key:</span>
      <code style="
        padding: 0.25rem 0.5rem;
        background: var(--color-surface-raised);
        border-radius: var(--radius-sm);
        font-family: var(--font-mono);
        font-size: 0.8125rem;
        color: var(--color-text-secondary);
      ">sk-cyb-xxxx...xxxx</code>
      <CopyButton text="sk-cyb-1234567890abcdef" label="Copy Key" />
    </div>
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <span style="font-family: var(--font-body); font-size: 0.8125rem; color: var(--color-text-tertiary);">Endpoint:</span>
      <code style="
        padding: 0.25rem 0.5rem;
        background: var(--color-surface-raised);
        border-radius: var(--radius-sm);
        font-family: var(--font-mono);
        font-size: 0.8125rem;
        color: var(--color-text-secondary);
      ">https://api.cyberdyne.io/v1</code>
      <CopyButton text="https://api.cyberdyne.io/v1" label="Copy URL" />
    </div>
  </div>
</Story>

<Story name="Outline">
  <div style="padding: 1rem; display: flex; gap: 1rem;">
    <CopyButton text="0x1234...abcd" label="Copy Address" variant="outline" />
    <CopyButton text="cyb_token_xyz" label="Copy Token" variant="outline" size="sm" />
  </div>
</Story>
