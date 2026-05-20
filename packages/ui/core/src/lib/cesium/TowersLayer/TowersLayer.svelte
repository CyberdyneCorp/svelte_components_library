<svelte:options runes={true} />

<script lang="ts">
  import TrackedEntitiesLayer from "../TrackedEntitiesLayer/TrackedEntitiesLayer.svelte";
  import { towerMast } from "../glyphs.js";
  import type { TrackedEntity, Tower } from "../types.js";

  type Props = {
    towers: Tower[];
    visible?: boolean;
    selectedId?: string | null;
    color?: string;
    onclick?: (tower: Tower) => void;
  };

  let {
    towers,
    visible = true,
    selectedId = $bindable(null),
    color = "#a855f7",
    onclick,
  }: Props = $props();

  const entities = $derived<TrackedEntity[]>(
    towers.map((t) => ({
      id: t.id,
      lng: t.lng,
      lat: t.lat,
      icon: towerMast(color),
      color,
      size: 22,
      meta: t,
    })),
  );

  function handleClick(entity: TrackedEntity): void {
    const t = entity.meta as Tower | undefined;
    if (t) onclick?.(t);
  }
</script>

<TrackedEntitiesLayer
  entities={entities}
  {visible}
  bind:selectedId
  idPrefix="tower"
  onclick={onclick ? handleClick : undefined}
/>
