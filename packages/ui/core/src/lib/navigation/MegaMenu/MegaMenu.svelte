<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";

  type MegaMenuItem = {
    label: string;
    href?: string;
    description?: string;
    icon?: string;
  };

  type MegaMenuSection = {
    title: string;
    items: MegaMenuItem[];
  };

  let {
    trigger,
    sections = [],
    open = $bindable(false),
    width = "100%",
    onnavigate,
  }: {
    trigger: Snippet;
    sections?: MegaMenuSection[];
    open?: boolean;
    width?: string;
    onnavigate?: (href: string) => void;
  } = $props();

  let leaveTimeout: ReturnType<typeof setTimeout> | null = null;

  function handleMouseEnter() {
    if (leaveTimeout) {
      clearTimeout(leaveTimeout);
      leaveTimeout = null;
    }
    open = true;
  }

  function handleMouseLeave() {
    leaveTimeout = setTimeout(() => {
      open = false;
    }, 300);
  }

  function handleTriggerClick() {
    open = !open;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      open = false;
    }
  }

  function handleItemClick(item: MegaMenuItem) {
    const href = item.href || "#";
    onnavigate?.(href);
    open = false;
  }

  function handleOutsideClick(e: MouseEvent) {
    if (!open) return; // Don't close if already closed
    const target = e.target as HTMLElement;
    if (!target.closest(".cy-megamenu")) {
      open = false;
    }
  }
</script>

<svelte:window onclick={handleOutsideClick} onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="cy-megamenu"
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  aria-label="Mega menu"
>
  <div class="cy-megamenu__trigger" onclick={handleTriggerClick} role="button" tabindex="0" aria-expanded={open} aria-haspopup="true" onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTriggerClick(); } }}>
    {#if trigger}
      {@render trigger()}
    {/if}
  </div>

  {#if open}
    <div
      class="cy-megamenu__panel"
      style:width={width}
      role="menu"
    >
      <div class="cy-megamenu__grid">
        {#each sections as section}
          <div class="cy-megamenu__section">
            <h3 class="cy-megamenu__section-title">{section.title}</h3>
            <ul class="cy-megamenu__section-list">
              {#each section.items as item}
                <li>
                  <a
                    class="cy-megamenu__item"
                    href={item.href || "#"}
                    role="menuitem"
                    onclick={() => handleItemClick(item)}
                  >
                    {#if item.icon}
                      <span class="cy-megamenu__item-icon">{item.icon}</span>
                    {/if}
                    <div class="cy-megamenu__item-content">
                      <span class="cy-megamenu__item-label">{item.label}</span>
                      {#if item.description}
                        <span class="cy-megamenu__item-desc">{item.description}</span>
                      {/if}
                    </div>
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .cy-megamenu {
    position: relative;
    display: inline-block;
  }

  .cy-megamenu__trigger {
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    color: inherit;
  }

  .cy-megamenu__panel {
    position: absolute;
    top: 100%;
    left: 0;
    background: var(--color-surface-raised, var(--color-surface-base));
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    margin-top: var(--space-2);
    box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.3));
    z-index: 1001;
    animation: cy-megamenu-slide 0.2s ease-out;
    font-family: var(--font-body);
  }

  @keyframes cy-megamenu-slide {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .cy-megamenu__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--space-6);
  }

  .cy-megamenu__section-title {
    font-size: 0.75rem;
    font-weight: var(--font-weight-bold, 700);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-tertiary);
    margin: 0 0 var(--space-3) 0;
    padding: 0 var(--space-2);
  }

  .cy-megamenu__section-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .cy-megamenu__item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-2);
    color: var(--color-text-secondary);
    text-decoration: none;
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
  }

  .cy-megamenu__item:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  .cy-megamenu__item-icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
  }

  .cy-megamenu__item-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .cy-megamenu__item-label {
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium);
  }

  .cy-megamenu__item-desc {
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
    line-height: 1.4;
  }
</style>
