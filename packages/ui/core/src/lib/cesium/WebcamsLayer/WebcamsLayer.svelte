<svelte:options runes={true} />

<script lang="ts">
  import TrackedEntitiesLayer from "../TrackedEntitiesLayer/TrackedEntitiesLayer.svelte";
  import { camera } from "../glyphs.js";
  import type { TrackedEntity, Webcam } from "../types.js";

  type Props = {
    webcams: Webcam[];
    visible?: boolean;
    /** Uniform layer opacity 0–1. */
    opacity?: number;
    selectedId?: string | null;
    color?: string;
    onclick?: (webcam: Webcam) => void;
  };

  let {
    webcams,
    visible = true,
    opacity = 1,
    selectedId = $bindable(null),
    color = "#00ff41",
    onclick,
  }: Props = $props();

  const entities = $derived<TrackedEntity[]>(
    webcams.map((w) => ({
      id: w.id,
      lng: w.lng,
      lat: w.lat,
      icon: camera(color),
      color,
      size: 22,
      label: w.title,
      meta: w,
    })),
  );

  function handleClick(entity: TrackedEntity): void {
    const w = entity.meta as Webcam | undefined;
    if (w) onclick?.(w);
  }
</script>

<TrackedEntitiesLayer
  entities={entities}
  {opacity}
  {visible}
  bind:selectedId
  idPrefix="webcam"
  onclick={onclick ? handleClick : undefined}
/>
