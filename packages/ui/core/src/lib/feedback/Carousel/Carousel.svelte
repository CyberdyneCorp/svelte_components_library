<svelte:options runes={true} />

<script lang="ts">
  let {
    items = [],
    autoPlay = false,
    interval = 5000,
    showDots = true,
    showArrows = true,
    loop = true,
  }: {
    items?: Array<{ content?: string; image?: string; title?: string }>;
    autoPlay?: boolean;
    interval?: number;
    showDots?: boolean;
    showArrows?: boolean;
    loop?: boolean;
  } = $props();

  let currentIndex = $state(0);
  let paused = $state(false);
  let dragging = $state(false);
  let dragStartX = $state(0);
  let dragDelta = $state(0);
  let trackEl: HTMLDivElement | undefined = $state(undefined);
  let timer: ReturnType<typeof setInterval> | undefined;

  let canPrev = $derived(loop || currentIndex > 0);
  let canNext = $derived(loop || currentIndex < items.length - 1);

  function goTo(index: number) {
    if (items.length === 0) return;
    if (loop) {
      currentIndex = ((index % items.length) + items.length) % items.length;
    } else {
      currentIndex = Math.max(0, Math.min(index, items.length - 1));
    }
  }

  function prev() {
    goTo(currentIndex - 1);
  }

  function next() {
    goTo(currentIndex + 1);
  }

  function startAutoPlay() {
    stopAutoPlay();
    if (autoPlay && items.length > 1) {
      timer = setInterval(() => {
        if (!paused) next();
      }, interval);
    }
  }

  function stopAutoPlay() {
    if (timer) {
      clearInterval(timer);
      timer = undefined;
    }
  }

  $effect(() => {
    if (autoPlay) {
      startAutoPlay();
    }
    return () => stopAutoPlay();
  });

  function handleMouseEnter() {
    paused = true;
  }

  function handleMouseLeave() {
    paused = false;
    if (!dragging) {
      dragDelta = 0;
    }
  }

  function handlePointerDown(e: PointerEvent) {
    dragging = true;
    dragStartX = e.clientX;
    dragDelta = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!dragging) return;
    dragDelta = e.clientX - dragStartX;
  }

  function handlePointerUp() {
    if (!dragging) return;
    dragging = false;
    const threshold = 50;
    if (dragDelta > threshold && canPrev) {
      prev();
    } else if (dragDelta < -threshold && canNext) {
      next();
    }
    dragDelta = 0;
  }

  let offset = $derived.by(() => {
    const base = -(currentIndex * 100);
    if (dragging && trackEl) {
      const pxPct = (dragDelta / trackEl.clientWidth) * 100;
      return base + pxPct;
    }
    return base;
  });
</script>

<div
  class="cy-car"
  role="region"
  aria-label="Carousel"
  aria-roledescription="carousel"
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
>
  <div class="cy-car__viewport">
    <div
      class="cy-car__track"
      class:cy-car__track--dragging={dragging}
      style="transform: translateX({offset}%)"
      bind:this={trackEl}
      onpointerdown={handlePointerDown}
      onpointermove={handlePointerMove}
      onpointerup={handlePointerUp}
      onpointercancel={handlePointerUp}
      role="presentation"
    >
      {#each items as item, i}
        <div
          class="cy-car__slide"
          role="group"
          aria-roledescription="slide"
          aria-label="Slide {i + 1} of {items.length}"
        >
          {#if item.image}
            <div class="cy-car__image" style="background-image: url({item.image})"></div>
          {/if}
          {#if item.title || item.content}
            <div class="cy-car__text">
              {#if item.title}
                <h3 class="cy-car__title">{item.title}</h3>
              {/if}
              {#if item.content}
                <p class="cy-car__content">{item.content}</p>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  {#if showArrows && items.length > 1}
    <button
      class="cy-car__arrow cy-car__arrow--prev"
      type="button"
      onclick={prev}
      disabled={!canPrev}
      aria-label="Previous slide"
    >
      <svg viewBox="0 0 16 16" width="18" height="18"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <button
      class="cy-car__arrow cy-car__arrow--next"
      type="button"
      onclick={next}
      disabled={!canNext}
      aria-label="Next slide"
    >
      <svg viewBox="0 0 16 16" width="18" height="18"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
  {/if}

  {#if showDots && items.length > 1}
    <div class="cy-car__dots" role="tablist">
      {#each items as _, i}
        <button
          class="cy-car__dot"
          class:cy-car__dot--active={i === currentIndex}
          type="button"
          role="tab"
          aria-selected={i === currentIndex}
          aria-label="Go to slide {i + 1}"
          onclick={() => goTo(i)}
        ></button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .cy-car {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: var(--radius-lg);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
  }

  .cy-car__viewport {
    overflow: hidden;
  }

  .cy-car__track {
    display: flex;
    transition: transform 0.4s ease;
    touch-action: pan-y;
    cursor: grab;
    user-select: none;
  }

  .cy-car__track--dragging {
    transition: none;
    cursor: grabbing;
  }

  .cy-car__slide {
    flex: 0 0 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .cy-car__image {
    width: 100%;
    height: 200px;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-color: var(--color-bg-tertiary);
  }

  .cy-car__text {
    padding: var(--space-4) var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .cy-car__title {
    font-family: var(--font-body);
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0;
  }

  .cy-car__content {
    font-family: var(--font-body);
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .cy-car__arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-full);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition-default);
    z-index: 2;
    box-shadow: var(--shadow-md);
  }

  .cy-car__arrow:hover:not(:disabled) {
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);
    border-color: var(--color-border-default);
  }

  .cy-car__arrow:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .cy-car__arrow--prev {
    left: var(--space-3);
  }

  .cy-car__arrow--next {
    right: var(--space-3);
  }

  .cy-car__dots {
    display: flex;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-3);
  }

  .cy-car__dot {
    width: 8px;
    height: 8px;
    border-radius: var(--radius-full);
    background: var(--color-border-subtle);
    border: none;
    cursor: pointer;
    transition: all var(--transition-default);
    padding: 0;
  }

  .cy-car__dot:hover {
    background: var(--color-text-tertiary);
  }

  .cy-car__dot--active {
    background: var(--color-action-brand-default);
    width: 20px;
    border-radius: 4px;
  }
</style>
