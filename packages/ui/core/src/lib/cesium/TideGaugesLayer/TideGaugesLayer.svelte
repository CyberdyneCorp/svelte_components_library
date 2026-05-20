<svelte:options runes={true} />

<script lang="ts">
  import TrackedEntitiesLayer from "../TrackedEntitiesLayer/TrackedEntitiesLayer.svelte";
  import { tideGauge } from "../glyphs.js";
  import type { TideGauge, TrackedEntity } from "../types.js";

  type Props = {
    gauges: TideGauge[];
    visible?: boolean;
    selectedId?: string | null;
    onclick?: (gauge: TideGauge) => void;
  };

  let {
    gauges,
    visible = true,
    selectedId = $bindable(null),
    onclick,
  }: Props = $props();

  // Anomaly → colour: large positive = red, large negative = cyan.
  function anomalyColor(anomalyM: number | undefined): string {
    if (typeof anomalyM !== "number") return "#9ca3af";
    if (anomalyM > 0.5) return "#ef4444";
    if (anomalyM > 0.1) return "#ffb800";
    if (anomalyM < -0.5) return "#00d4ff";
    if (anomalyM < -0.1) return "#a855f7";
    return "#22c55e";
  }

  const entities = $derived<TrackedEntity[]>(
    gauges.map((g) => {
      const color = anomalyColor(g.anomalyM);
      return {
        id: g.id,
        lng: g.lng,
        lat: g.lat,
        icon: tideGauge(color),
        color,
        size: 20,
        label: g.station,
        meta: g,
      };
    }),
  );

  function handleClick(entity: TrackedEntity): void {
    const g = entity.meta as TideGauge | undefined;
    if (g) onclick?.(g);
  }
</script>

<TrackedEntitiesLayer
  entities={entities}
  {visible}
  bind:selectedId
  idPrefix="tide"
  onclick={onclick ? handleClick : undefined}
/>
