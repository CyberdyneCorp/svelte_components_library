<svelte:options runes={true} />

<script lang="ts">
  import PolylinesLayer from "../PolylinesLayer/PolylinesLayer.svelte";
  import type { Polyline, SubmarineCable } from "../types.js";

  type Props = {
    cables: SubmarineCable[];
    visible?: boolean;
    selectedId?: string | null;
    color?: string;
    /** Render planned cables with a dashed material. */
    dashPlanned?: boolean;
    onclick?: (cable: SubmarineCable) => void;
  };

  let {
    cables,
    visible = true,
    selectedId = $bindable(null),
    color = "#00d4ff",
    dashPlanned = true,
    onclick,
  }: Props = $props();

  const polylines = $derived<Polyline[]>(
    cables.map((c) => ({
      id: c.id,
      vertices: c.vertices,
      color:
        c.status === "out-of-service"
          ? "#6b7280"
          : c.status === "planned"
            ? "#a855f7"
            : color,
      width: 2,
      dashed: dashPlanned && c.status === "planned",
      meta: c,
    })),
  );

  function handleClick(line: Polyline): void {
    const cable = line.meta as SubmarineCable | undefined;
    if (cable) onclick?.(cable);
  }
</script>

<PolylinesLayer
  polylines={polylines}
  {visible}
  bind:selectedId
  onclick={onclick ? handleClick : undefined}
/>
