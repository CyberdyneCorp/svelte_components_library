<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Toast from "./Toast.svelte";

  const { Story } = defineMeta({
    title: "Feedback/Toast",
    component: Toast,
    tags: ["autodocs"],
  });
</script>

<Story name="Success">
  <div style="padding: 1rem;">
    <p style="color: var(--color-text-secondary); font-family: var(--font-body); font-size: 0.875rem; margin-bottom: 1rem;">
      Toast component provides a context-based API. Wrap your app in {'<Toast>'} and use getContext("toast") to trigger notifications.
    </p>
    <div style="display: flex; flex-direction: column; gap: 0.75rem; max-width: 400px;">
      <div class="toast-preview toast-preview--success">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-action-brand-default)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Operation completed successfully</span>
      </div>
    </div>
  </div>
</Story>

<Story name="Warning">
  <div style="padding: 1rem;">
    <div style="display: flex; flex-direction: column; gap: 0.75rem; max-width: 400px;">
      <div class="toast-preview toast-preview--warning">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-state-warning)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 9v2m0 4h.01M12 3l9.66 16.5H2.34L12 3z" />
        </svg>
        <span>Rate limit approaching threshold</span>
      </div>
    </div>
  </div>
</Story>

<Story name="Error">
  <div style="padding: 1rem;">
    <div style="display: flex; flex-direction: column; gap: 0.75rem; max-width: 400px;">
      <div class="toast-preview toast-preview--error">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-state-error)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Connection to server failed</span>
      </div>
    </div>
  </div>
</Story>

<Story name="WithAction">
  <div style="padding: 1rem;">
    <div style="display: flex; flex-direction: column; gap: 0.75rem; max-width: 400px;">
      <div class="toast-preview toast-preview--info">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-action-secondary-default)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span style="flex: 1;">New update available</span>
        <button class="toast-action-btn">Update</button>
      </div>
    </div>
  </div>
</Story>

<style>
  .toast-preview {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: var(--radius-md);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-default);
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-text-primary);
    box-shadow: var(--shadow-lg);
  }

  .toast-preview--success { border-left: 3px solid var(--color-action-brand-default); }
  .toast-preview--warning { border-left: 3px solid var(--color-state-warning); }
  .toast-preview--error { border-left: 3px solid var(--color-state-error); }
  .toast-preview--info { border-left: 3px solid var(--color-action-secondary-default); }

  .toast-action-btn {
    background: none;
    border: none;
    color: var(--color-action-brand-default);
    font-family: var(--font-body);
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-sm);
  }
  .toast-action-btn:hover {
    background: var(--color-border-subtle);
  }
</style>
