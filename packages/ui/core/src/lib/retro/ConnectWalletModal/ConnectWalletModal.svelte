<svelte:options runes={true} />

<script lang="ts">
  import type { WalletProvider } from "./types.js";

  let {
    open = $bindable(false),
    title = "CONNECT WALLET",
    providers = [],
    onSelect,
    onClose,
  }: {
    open?: boolean;
    title?: string;
    providers: WalletProvider[];
    onSelect?: (id: string) => void;
    onClose?: () => void;
  } = $props();

  function close() {
    open = false;
    onClose?.();
  }

  function select(p: WalletProvider) {
    if (p.disabled) return;
    onSelect?.(p.id);
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") close();
  }

  function onBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) close();
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="cy-cw__backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="cy-cw-title"
    tabindex="-1"
    onclick={onBackdrop}
    onkeydown={onKey}
  >
    <div class="cy-cw">
      <div class="cy-cw__header">
        <span class="cy-cw__monitor" aria-hidden="true">▭</span>
        <h2 class="cy-cw__title" id="cy-cw-title">{title}</h2>
        <button class="cy-cw__close" aria-label="Close" onclick={close}>×</button>
      </div>
      <div class="cy-cw__divider" aria-hidden="true"></div>
      <div class="cy-cw__list">
        {#each providers as p (p.id)}
          <button
            class="cy-cw__item"
            disabled={p.disabled}
            onclick={() => select(p)}
          >
            <span class="cy-cw__icon" aria-hidden="true">
              {#if p.iconSrc}
                <img src={p.iconSrc} alt="" />
              {:else if p.icon}
                {p.icon}
              {/if}
            </span>
            <span class="cy-cw__text">
              <span class="cy-cw__name">{p.name}</span>
              {#if p.description}
                <span class="cy-cw__desc">{p.description}</span>
              {/if}
            </span>
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .cy-cw__backdrop {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(10, 10, 15, 0.85);
    backdrop-filter: blur(4px);
    z-index: 1000;
  }
  .cy-cw {
    width: 100%;
    max-width: 460px;
    background: #000;
    border: 2px solid #00ff41;
    border-radius: 10px;
    padding: 18px 20px;
    box-shadow: 0 0 24px rgba(0, 255, 65, 0.35);
    font-family: "Courier New", monospace;
    color: #00ff41;
  }
  .cy-cw__header {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .cy-cw__monitor { font-size: 1.1rem; }
  .cy-cw__title {
    flex: 1;
    margin: 0;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    font-weight: 700;
  }
  .cy-cw__close {
    background: transparent;
    border: 0;
    color: #00ff41;
    font-size: 1.2rem;
    cursor: pointer;
    width: 24px;
    height: 24px;
  }
  .cy-cw__close:hover { color: #00ff90; }
  .cy-cw__divider {
    margin: 8px 0 14px;
    height: 1px;
    background: rgba(0, 255, 65, 0.4);
  }
  .cy-cw__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .cy-cw__item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: rgba(0, 255, 65, 0.04);
    border: 1px solid rgba(0, 255, 65, 0.55);
    border-radius: 8px;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  .cy-cw__item:hover:not(:disabled) {
    background: rgba(0, 255, 65, 0.12);
    box-shadow: 0 0 12px rgba(0, 255, 65, 0.3);
  }
  .cy-cw__item:disabled { opacity: 0.45; cursor: not-allowed; }
  .cy-cw__icon {
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
  }
  .cy-cw__icon img { max-width: 100%; max-height: 100%; }
  .cy-cw__text { display: flex; flex-direction: column; }
  .cy-cw__name { font-weight: 700; }
  .cy-cw__desc {
    font-size: 0.8rem;
    color: rgba(0, 255, 65, 0.75);
  }
</style>
