<svelte:options runes={true} />

<script lang="ts">
  import TrackedEntitiesLayer from "../TrackedEntitiesLayer/TrackedEntitiesLayer.svelte";
  import { buoy } from "../glyphs.js";
  import type { TrackedEntity, TsunamiBuoy } from "../types.js";

  type Props = {
    buoys: TsunamiBuoy[];
    visible?: boolean;
    /** Uniform layer opacity 0–1. */
    opacity?: number;
    selectedId?: string | null;
    onclick?: (buoy: TsunamiBuoy) => void;
  };

  let {
    buoys,
    visible = true,
    opacity = 1,
    selectedId = $bindable(null),
    onclick,
  }: Props = $props();

  function statusColor(status: TsunamiBuoy["status"]): string {
    switch (status) {
      case "event":
        return "#ef4444";
      case "watch":
        return "#ffb800";
      case "offline":
        return "#6b7280";
      case "ok":
      default:
        return "#00d4ff";
    }
  }

  const entities = $derived<TrackedEntity[]>(
    buoys.map((b) => {
      const color = statusColor(b.status);
      return {
        id: b.id,
        lng: b.lng,
        lat: b.lat,
        icon: buoy(color),
        color,
        size: b.status === "event" ? 32 : 22,
        meta: b,
      };
    }),
  );

  function handleClick(entity: TrackedEntity): void {
    const b = entity.meta as TsunamiBuoy | undefined;
    if (b) onclick?.(b);
  }
</script>

<TrackedEntitiesLayer
  entities={entities}
  {opacity}
  {visible}
  bind:selectedId
  idPrefix="tsu"
  onclick={onclick ? handleClick : undefined}
/>
