<svelte:options runes={true} />

<script lang="ts">
  import TrackedEntitiesLayer from "../TrackedEntitiesLayer/TrackedEntitiesLayer.svelte";
  import { powerPlant } from "../glyphs.js";
  import type { PowerPlant, PowerPlantFuel, TrackedEntity } from "../types.js";

  type Props = {
    powerPlants: PowerPlant[];
    visible?: boolean;
    /** Uniform layer opacity 0–1. */
    opacity?: number;
    selectedId?: string | null;
    /** Show only these fuel types. */
    fuelFilter?: PowerPlantFuel[] | null;
    /** Filter to plants with capacity above this MW threshold. */
    minCapacityMw?: number;
    /** Hex colour by fuel type. */
    colorByFuel?: Partial<Record<PowerPlantFuel, string>>;
    onclick?: (plant: PowerPlant) => void;
  };

  const DEFAULT_COLORS: Record<PowerPlantFuel, string> = {
    coal: "#374151",
    gas: "#ff7a1a",
    oil: "#a855f7",
    nuclear: "#00d4ff",
    hydro: "#0ea5e9",
    wind: "#22c55e",
    solar: "#ffb800",
    biomass: "#84cc16",
    geothermal: "#ef4444",
    other: "#9ca3af",
  };

  let {
    powerPlants,
    visible = true,
    opacity = 1,
    selectedId = $bindable(null),
    fuelFilter = null,
    minCapacityMw = 0,
    colorByFuel,
    onclick,
  }: Props = $props();

  function capacitySize(mw: number | undefined): number {
    if (typeof mw !== "number") return 18;
    return Math.max(14, Math.min(32, 12 + Math.log10(mw + 1) * 5));
  }

  const entities = $derived<TrackedEntity[]>(
    powerPlants
      .filter((p) => {
        if (fuelFilter && !fuelFilter.includes(p.fuel ?? "other")) return false;
        if ((p.capacityMw ?? 0) < minCapacityMw) return false;
        return true;
      })
      .map((p) => {
        const fuel = p.fuel ?? "other";
        const color = colorByFuel?.[fuel] ?? DEFAULT_COLORS[fuel];
        return {
          id: p.id,
          lng: p.lng,
          lat: p.lat,
          icon: powerPlant(color),
          color,
          size: capacitySize(p.capacityMw),
          label: p.name,
          meta: p,
        };
      }),
  );

  function handleClick(entity: TrackedEntity): void {
    const p = entity.meta as PowerPlant | undefined;
    if (p) onclick?.(p);
  }
</script>

<TrackedEntitiesLayer
  entities={entities}
  {opacity}
  {visible}
  bind:selectedId
  idPrefix="plant"
  onclick={onclick ? handleClick : undefined}
/>
