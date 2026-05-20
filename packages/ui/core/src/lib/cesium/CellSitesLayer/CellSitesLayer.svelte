<svelte:options runes={true} />

<script lang="ts">
  import TrackedEntitiesLayer from "../TrackedEntitiesLayer/TrackedEntitiesLayer.svelte";
  import { circleDot } from "../glyphs.js";
  import type { CellSite, TrackedEntity } from "../types.js";

  type Props = {
    cellSites: CellSite[];
    visible?: boolean;
    selectedId?: string | null;
    /** Hex colour by radio technology. */
    colorByRadio?: Partial<Record<string, string>>;
    onclick?: (cellSite: CellSite) => void;
  };

  const DEFAULT_COLORS: Record<string, string> = {
    "5G": "#a855f7",
    LTE: "#00d4ff",
    GSM: "#9ca3af",
  };

  let {
    cellSites,
    visible = true,
    selectedId = $bindable(null),
    colorByRadio,
    onclick,
  }: Props = $props();

  const entities = $derived<TrackedEntity[]>(
    cellSites.map((c) => {
      const radio = c.radio ?? "LTE";
      const color =
        colorByRadio?.[radio] ?? DEFAULT_COLORS[radio] ?? DEFAULT_COLORS.LTE;
      return {
        id: c.id,
        lng: c.lng,
        lat: c.lat,
        icon: circleDot(color),
        color,
        size: 14,
        meta: c,
      };
    }),
  );

  function handleClick(entity: TrackedEntity): void {
    const c = entity.meta as CellSite | undefined;
    if (c) onclick?.(c);
  }
</script>

<TrackedEntitiesLayer
  entities={entities}
  {visible}
  bind:selectedId
  idPrefix="cell"
  onclick={onclick ? handleClick : undefined}
/>
