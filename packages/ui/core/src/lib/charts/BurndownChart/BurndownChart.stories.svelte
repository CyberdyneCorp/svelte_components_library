<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import BurndownChart from "./BurndownChart.svelte";

  const { Story } = defineMeta({
    title: "Charts/BurndownChart",
    component: BurndownChart,
    tags: ["autodocs"],
  });

  const onTrackData = [
    { date: "2026-03-16", remaining: 40 },
    { date: "2026-03-17", remaining: 38 },
    { date: "2026-03-18", remaining: 34 },
    { date: "2026-03-19", remaining: 30 },
    { date: "2026-03-20", remaining: 26 },
    { date: "2026-03-21", remaining: 22 },
    { date: "2026-03-22", remaining: 18 },
    { date: "2026-03-23", remaining: 14 },
    { date: "2026-03-24", remaining: 8 },
    { date: "2026-03-25", remaining: 4 },
    { date: "2026-03-26", remaining: 2 },
  ];

  const behindData = [
    { date: "2026-03-16", remaining: 40 },
    { date: "2026-03-17", remaining: 39 },
    { date: "2026-03-18", remaining: 37 },
    { date: "2026-03-19", remaining: 36 },
    { date: "2026-03-20", remaining: 34 },
    { date: "2026-03-21", remaining: 33 },
    { date: "2026-03-22", remaining: 31 },
    { date: "2026-03-23", remaining: 29 },
    { date: "2026-03-24", remaining: 27 },
    { date: "2026-03-25", remaining: 25 },
    { date: "2026-03-26", remaining: 22 },
  ];

  const aheadData = [
    { date: "2026-03-16", remaining: 40 },
    { date: "2026-03-17", remaining: 35 },
    { date: "2026-03-18", remaining: 28 },
    { date: "2026-03-19", remaining: 22 },
    { date: "2026-03-20", remaining: 16 },
    { date: "2026-03-21", remaining: 12 },
    { date: "2026-03-22", remaining: 8 },
    { date: "2026-03-23", remaining: 5 },
    { date: "2026-03-24", remaining: 2 },
    { date: "2026-03-25", remaining: 1 },
    { date: "2026-03-26", remaining: 0 },
  ];
</script>

<Story name="OnTrack" args={{
  data: onTrackData,
  totalPoints: 40,
  sprintStart: "2026-03-16",
  sprintEnd: "2026-03-26",
  unit: "points",
}} />

<Story name="BehindSchedule" args={{
  data: behindData,
  totalPoints: 40,
  sprintStart: "2026-03-16",
  sprintEnd: "2026-03-26",
  unit: "points",
}} />

<Story name="Ahead" args={{
  data: aheadData,
  totalPoints: 40,
  sprintStart: "2026-03-16",
  sprintEnd: "2026-03-26",
  unit: "points",
}} />
