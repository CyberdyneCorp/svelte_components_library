<svelte:options runes={true} />

<script lang="ts">
  type WordItem = { text: string; weight: number };

  let {
    words = [],
    width = 600,
    height = 300,
    minFontSize = 12,
    maxFontSize = 48,
    colorScheme = ['#00ff41', '#00d4ff', '#ff6b6b', '#ffd93d', '#c084fc', '#22d3ee', '#fb923c'],
    class: className = '',
  }: {
    words?: WordItem[];
    width?: number;
    height?: number;
    minFontSize?: number;
    maxFontSize?: number;
    colorScheme?: string[];
    class?: string;
  } = $props();

  interface PlacedWord {
    text: string;
    x: number;
    y: number;
    fontSize: number;
    rotation: number;
    color: string;
    fontFamily: string;
  }

  // Seeded pseudo-random for deterministic layout
  function seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
      s = (s * 16807 + 0) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  let placedWords = $derived.by((): PlacedWord[] => {
    if (!words.length) return [];

    const sorted = [...words].sort((a, b) => b.weight - a.weight);
    const maxWeight = sorted[0].weight;
    const minWeight = sorted[sorted.length - 1].weight;
    const weightRange = maxWeight - minWeight || 1;

    const rand = seededRandom(42);
    const placed: PlacedWord[] = [];
    const boxes: { x: number; y: number; w: number; h: number }[] = [];

    const cx = width / 2;
    const cy = height / 2;

    // Approximate character width factor (proportional to font size)
    const charWidthFactor = 0.6;

    function getFontSize(weight: number): number {
      if (sorted.length === 1) return (minFontSize + maxFontSize) / 2;
      return minFontSize + ((weight - minWeight) / weightRange) * (maxFontSize - minFontSize);
    }

    function getBBox(text: string, fontSize: number, rotation: number, x: number, y: number) {
      const textWidth = text.length * fontSize * charWidthFactor;
      const textHeight = fontSize * 1.2;

      if (rotation === 90) {
        return {
          x: x - textHeight / 2,
          y: y - textWidth / 2,
          w: textHeight,
          h: textWidth,
        };
      }
      return {
        x: x - textWidth / 2,
        y: y - textHeight / 2,
        w: textWidth,
        h: textHeight,
      };
    }

    function overlaps(box: { x: number; y: number; w: number; h: number }): boolean {
      const pad = 4;
      for (const b of boxes) {
        if (
          box.x - pad < b.x + b.w + pad &&
          box.x + box.w + pad > b.x - pad &&
          box.y - pad < b.y + b.h + pad &&
          box.y + box.h + pad > b.y - pad
        ) {
          return true;
        }
      }
      return false;
    }

    function inBounds(box: { x: number; y: number; w: number; h: number }): boolean {
      return box.x >= 0 && box.y >= 0 && box.x + box.w <= width && box.y + box.h <= height;
    }

    for (let i = 0; i < sorted.length; i++) {
      const word = sorted[i];
      const fontSize = getFontSize(word.weight);
      const rotation = rand() < 0.7 ? 0 : 90;
      const color = colorScheme[i % colorScheme.length];
      const fontFamily = fontSize >= (minFontSize + maxFontSize) / 2
        ? 'var(--font-display, "Orbitron", sans-serif)'
        : 'var(--font-mono, monospace)';

      let didPlace = false;

      // Archimedean spiral placement
      const spiralStep = 1;
      const maxAngle = 360 * 10; // up to 10 full revolutions

      for (let angle = 0; angle < maxAngle; angle += spiralStep) {
        const rad = (angle * Math.PI) / 180;
        const r = 1 + angle * 0.15;
        const tx = cx + r * Math.cos(rad);
        const ty = cy + r * Math.sin(rad);

        const box = getBBox(word.text, fontSize, rotation, tx, ty);

        if (inBounds(box) && !overlaps(box)) {
          placed.push({ text: word.text, x: tx, y: ty, fontSize, rotation, color, fontFamily });
          boxes.push(box);
          didPlace = true;
          break;
        }
      }

      // If spiral didn't find a spot, skip this word
      if (!didPlace) continue;
    }

    return placed;
  });
</script>

<div class="cy-word-cloud {className}">
  <svg
    viewBox="0 0 {width} {height}"
    class="cy-word-cloud__svg"
    {width}
    {height}
    role="img"
    aria-label="Word cloud"
  >
    {#each placedWords as word}
      <text
        x={word.x}
        y={word.y}
        font-size={word.fontSize}
        fill={word.color}
        font-family={word.fontFamily}
        text-anchor="middle"
        dominant-baseline="central"
        transform={word.rotation ? `rotate(${word.rotation}, ${word.x}, ${word.y})` : undefined}
        class="cy-word-cloud__word"
      >
        {word.text}
      </text>
    {/each}
  </svg>
</div>

<style>
  .cy-word-cloud {
    display: inline-block;
    font-family: var(--font-body);
  }

  .cy-word-cloud__svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .cy-word-cloud__word {
    transition: opacity 150ms ease;
    cursor: default;
  }

  .cy-word-cloud__word:hover {
    opacity: 0.7;
  }
</style>
