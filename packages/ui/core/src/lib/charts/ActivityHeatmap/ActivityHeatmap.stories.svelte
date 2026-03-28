<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ActivityHeatmap from "./ActivityHeatmap.svelte";

  const { Story } = defineMeta({
    title: "Charts/ActivityHeatmap",
    component: ActivityHeatmap,
    tags: ["autodocs"],
  });

  function generateContributions() {
    const data = [];
    const end = new Date("2026-03-28");
    const start = new Date(end);
    start.setDate(start.getDate() - 364);

    const cursor = new Date(start);
    while (cursor <= end) {
      const dayOfWeek = cursor.getDay();
      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
      const base = isWeekday ? 4 : 1;
      const value = Math.random() < 0.15 ? 0 : Math.floor(Math.random() * (isWeekday ? 15 : 6) + base * Math.random());

      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, "0");
      const d = String(cursor.getDate()).padStart(2, "0");

      data.push({ date: `${y}-${m}-${d}`, value });
      cursor.setDate(cursor.getDate() + 1);
    }
    return data;
  }

  function generateDeployments() {
    const data = [];
    const end = new Date("2026-03-28");
    const start = new Date(end);
    start.setDate(start.getDate() - 364);

    const cursor = new Date(start);
    while (cursor <= end) {
      const value = Math.random() < 0.7 ? 0 : Math.floor(Math.random() * 5 + 1);

      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, "0");
      const d = String(cursor.getDate()).padStart(2, "0");

      if (value > 0) {
        data.push({ date: `${y}-${m}-${d}`, value });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return data;
  }

  function generateSparse() {
    const data = [];
    const end = new Date("2026-03-28");
    const start = new Date(end);
    start.setDate(start.getDate() - 364);

    for (let i = 0; i < 30; i++) {
      const offset = Math.floor(Math.random() * 365);
      const d = new Date(start);
      d.setDate(d.getDate() + offset);

      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");

      data.push({ date: `${y}-${m}-${day}`, value: Math.floor(Math.random() * 10 + 1) });
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
