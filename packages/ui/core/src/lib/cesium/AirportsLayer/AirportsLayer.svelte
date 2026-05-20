<svelte:options runes={true} />

<script lang="ts">
  import TrackedEntitiesLayer from "../TrackedEntitiesLayer/TrackedEntitiesLayer.svelte";
  import { airportPin } from "../glyphs.js";
  import type { Airport, AirportType, TrackedEntity } from "../types.js";

  type Props = {
    airports: Airport[];
    visible?: boolean;
    selectedId?: string | null;
    /** Show only these airport types. */
    typeFilter?: AirportType[] | null;
    /** Hex colour per airport type. */
    colorByType?: Partial<Record<AirportType, string>>;
    onclick?: (airport: Airport) => void;
  };

  const SIZE_BY_TYPE: Record<AirportType, number> = {
    large_airport: 30,
    medium_airport: 24,
    small_airport: 18,
    heliport: 16,
    seaplane_base: 16,
  };

  const DEFAULT_COLORS: Record<AirportType, string> = {
    large_airport: "#00d4ff",
    medium_airport: "#00ff41",
    small_airport: "#a855f7",
    heliport: "#ffb800",
    seaplane_base: "#9ca3af",
  };

  let {
    airports,
    visible = true,
    selectedId = $bindable(null),
    typeFilter = null,
    colorByType,
    onclick,
  }: Props = $props();

  const entities = $derived<TrackedEntity[]>(
    airports
      .filter((a) => !typeFilter || typeFilter.includes(a.type ?? "small_airport"))
      .map((a) => {
        const type = a.type ?? "small_airport";
        const color = colorByType?.[type] ?? DEFAULT_COLORS[type];
        return {
          id: a.id,
          lng: a.lng,
          lat: a.lat,
          icon: airportPin(color),
          color,
          size: SIZE_BY_TYPE[type],
          label: a.iata ?? a.icao,
          meta: a,
        };
      }),
  );

  function handleClick(entity: TrackedEntity): void {
    const a = entity.meta as Airport | undefined;
    if (a) onclick?.(a);
  }
</script>

<TrackedEntitiesLayer
  entities={entities}
  {visible}
  bind:selectedId
  idPrefix="airport"
  onclick={onclick ? handleClick : undefined}
/>
