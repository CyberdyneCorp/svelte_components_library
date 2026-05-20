<svelte:options runes={true} />

<script lang="ts">
  import TrackedEntitiesLayer from "../TrackedEntitiesLayer/TrackedEntitiesLayer.svelte";
  import { airQuality } from "../glyphs.js";
  import type { AirQualityStation, TrackedEntity } from "../types.js";

  type Props = {
    stations: AirQualityStation[];
    visible?: boolean;
    selectedId?: string | null;
    onclick?: (station: AirQualityStation) => void;
  };

  let {
    stations,
    visible = true,
    selectedId = $bindable(null),
    onclick,
  }: Props = $props();

  // EPA AQI bands → standard colour ramp.
  function aqiColor(aqi: number): string {
    if (aqi <= 50) return "#22c55e"; // good
    if (aqi <= 100) return "#ffb800"; // moderate
    if (aqi <= 150) return "#ff7a1a"; // sensitive
    if (aqi <= 200) return "#ef4444"; // unhealthy
    if (aqi <= 300) return "#a855f7"; // very unhealthy
    return "#7f1d1d"; // hazardous
  }

  const entities = $derived<TrackedEntity[]>(
    stations.map((s) => {
      const color = aqiColor(s.aqi);
      return {
        id: s.id,
        lng: s.lng,
        lat: s.lat,
        icon: airQuality(color),
        color,
        size: 22,
        label: `${Math.round(s.aqi)}`,
        meta: s,
      };
    }),
  );

  function handleClick(entity: TrackedEntity): void {
    const s = entity.meta as AirQualityStation | undefined;
    if (s) onclick?.(s);
  }
</script>

<TrackedEntitiesLayer
  entities={entities}
  {visible}
  bind:selectedId
  alwaysShowLabels={true}
  idPrefix="aq"
  onclick={onclick ? handleClick : undefined}
/>
