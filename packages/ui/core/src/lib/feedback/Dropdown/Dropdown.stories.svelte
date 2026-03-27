<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Dropdown from "./Dropdown.svelte";

  const { Story } = defineMeta({
    title: "Feedback/Dropdown",
    component: Dropdown,
    tags: ["autodocs"],
  });
</script>

<script>
  let selected = $state("");
</script>

<Story name="Default">
  <div style="padding: 1rem;">
    <Dropdown
      items={[
        { label: "Edit", value: "edit" },
        { label: "Duplicate", value: "duplicate" },
        { label: "Archive", value: "archive" },
        { label: "Delete", value: "delete", variant: "danger" },
      ]}
      onselect={(v) => (selected = v)}
    >
      {#snippet trigger()}
        <button class="trigger-btn">Actions ▾</button>
      {/snippet}
    </Dropdown>
    {#if selected}
      <p style="margin-top: 1rem; color: var(--color-text-secondary); font-family: var(--font-body); font-size: 0.8125rem;">
        Selected: {selected}
      </p>
    {/if}
  </div>
</Story>

<Story name="WithIcons">
  <div style="padding: 1rem;">
    <Dropdown
      items={[
        { label: "Dashboard", value: "dashboard", icon: "📊" },
        { label: "Settings", value: "settings", icon: "⚙" },
        { label: "Terminal", value: "terminal", icon: "💻" },
        { label: "Logout", value: "logout", icon: "🚪", variant: "danger" },
      ]}
      onselect={(v) => {}}
    >
      {#snippet trigger()}
        <button class="trigger-btn">Menu ▾</button>
      {/snippet}
    </Dropdown>
  </div>
</Story>

<Story name="RightAligned">
  <div style="padding: 1rem; display: flex; justify-content: flex-end;">
    <Dropdown
      align="right"
      items={[
        { label: "Profile", value: "profile" },
        { label: "API Keys", value: "api-keys" },
        { label: "Billing", value: "billing" },
      ]}
      onselect={(v) => {}}
    >
      {#snippet trigger()}
        <button class="trigger-btn">Account ▾</button>
      {/snippet}
    </Dropdown>
  </div>
</Story>

<style>
  .trigger-btn {
    padding: 0.5rem 1rem;
    background: var(--color-surface-raised);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-family: var(--font-body);
    font-size: 0.875rem;
  }
  .trigger-btn:hover {
    background: var(--color-surface-hover);
  }
</style>
