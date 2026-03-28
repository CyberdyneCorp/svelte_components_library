<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Gauge from "./Gauge.svelte";

  const { Story } = defineMeta({
    title: "Charts/Gauge",
    component: Gauge,
    tags: ["autodocs"],
  });

  const customThresholds = [
    { value: 80, color: "var(--color-state-success)" },
    { value: 150, color: "var(--color-state-warning)" },
    { value: 200, color: "var(--color-state-error)" },
  ];
</script>

<Story name="Default" args={{ value: 65, label: "CPU", unit: "%" }} />

<Story name="HighValue" args={{ value: 120, min: 0, max: 200, label: "Gas", unit: " gwei", size: 180 }} />

<Story name="WithThresholds" args={{ value: 145, min: 0, max: 200, label: "Network Load", unit: "", size: 180, thresholds: customThresholds }} />
