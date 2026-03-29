<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ActivityHeatmap from "./ActivityHeatmap.svelte";

  const { Story } = defineMeta({
    title: "Charts/ActivityHeatmap",
    component: ActivityHeatmap,
    tags: ["autodocs"],
  });

  // Use seeded pseudo-random for consistent data across renders
  function seededRandom(seed) {
    let s = seed;
    return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
  }

  function generateContributions() {
    const data = [];
    const rng = seededRandom(42);
    const end = new Date("2026-03-28");
    const cursor = new Date(end);
    cursor.setDate(cursor.getDate() - 364);

    while (cursor <= end) {
      const dow = cursor.getDay();
      const isWeekday = dow >= 1 && dow <= 5;
      const value = rng() < 0.15 ? 0 : Math.floor(rng() * (isWeekday ? 15 : 6));
      data.push({ date: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`, value });
      cursor.setDate(cursor.getDate() + 1);
    }
    return data;
  }

  function generateDeployments() {
    const data = [];
    const rng = seededRandom(99);
    const end = new Date("2026-03-28");
    const cursor = new Date(end);
    cursor.setDate(cursor.getDate() - 364);

    while (cursor <= end) {
      const value = rng() < 0.7 ? 0 : Math.floor(rng() * 5 + 1);
      if (value > 0) {
        data.push({ date: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`, value });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return data;
  }

  function generateSparse() {
    const data = [];
    const rng = seededRandom(7);
    const start = new Date("2026-03-28");
    start.setDate(start.getDate() - 364);

    for (let i = 0; i < 30; i++) {
      const offset = Math.floor(rng() * 365);
      const d = new Date(start);
      d.setDate(d.getDate() + offset);
      data.push({ date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`, value: Math.floor(rng() * 10 + 1) });
    }
    return data;
  }

  const contributionsData = generateContributions();
  const deploymentsData = generateDeployments();
  const sparseData = generateSparse();
</script>

<Story name="Contributions" args={{ data: contributionsData, colorScale: "green", label: "Contributions" }} />

<Story name="Deployments" args={{ data: deploymentsData, colorScale: "cyan", label: "Deployments" }} />

<Story name="Sparse" args={{ data: sparseData, colorScale: "violet", label: "Activity" }} />
