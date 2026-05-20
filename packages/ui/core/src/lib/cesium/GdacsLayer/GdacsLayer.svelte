<svelte:options runes={true} />

<script lang="ts">
  import TrackedEntitiesLayer from "../TrackedEntitiesLayer/TrackedEntitiesLayer.svelte";
  import { alertTriangle, quakeMark, flame, volcanoCone, buoy } from "../glyphs.js";
  import type {
    GdacsAlertLevel,
    GdacsEvent,
    GdacsEventType,
    TrackedEntity,
  } from "../types.js";

  type Props = {
    events: GdacsEvent[];
    visible?: boolean;
    /** Uniform layer opacity 0–1. */
    opacity?: number;
    selectedId?: string | null;
    /** Show only these alert levels. */
    alertFilter?: GdacsAlertLevel[] | null;
    /** Show only these event types. */
    typeFilter?: GdacsEventType[] | null;
    onclick?: (event: GdacsEvent) => void;
  };

  let {
    events,
    visible = true,
    opacity = 1,
    selectedId = $bindable(null),
    alertFilter = null,
    typeFilter = null,
    onclick,
  }: Props = $props();

  function alertColor(level: GdacsAlertLevel): string {
    switch (level) {
      case "Red":
        return "#ef4444";
      case "Orange":
        return "#ff7a1a";
      case "Green":
      default:
        return "#22c55e";
    }
  }

  function glyphFor(event: GdacsEvent): string {
    const color = alertColor(event.alertLevel);
    switch (event.eventType) {
      case "EQ":
        return quakeMark(color);
      case "WF":
        return flame(color);
      case "VO":
        return volcanoCone(color);
      case "FL":
      case "TC":
        return buoy(color);
      case "DR":
      default:
        return alertTriangle(color);
    }
  }

  const entities = $derived<TrackedEntity[]>(
    events
      .filter((e) => {
        if (alertFilter && !alertFilter.includes(e.alertLevel)) return false;
        if (typeFilter && !typeFilter.includes(e.eventType)) return false;
        return true;
      })
      .map((e) => ({
        id: e.id,
        lng: e.lng,
        lat: e.lat,
        icon: glyphFor(e),
        color: alertColor(e.alertLevel),
        size: e.alertLevel === "Red" ? 32 : e.alertLevel === "Orange" ? 26 : 22,
        label: e.title,
        meta: e,
      })),
  );

  function handleClick(entity: TrackedEntity): void {
    const e = entity.meta as GdacsEvent | undefined;
    if (e) onclick?.(e);
  }
</script>

<TrackedEntitiesLayer
  entities={entities}
  {opacity}
  {visible}
  bind:selectedId
  idPrefix="gdacs"
  onclick={onclick ? handleClick : undefined}
/>
