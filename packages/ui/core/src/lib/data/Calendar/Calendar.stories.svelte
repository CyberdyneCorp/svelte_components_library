<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Calendar from "./Calendar.svelte";

  const todayISO = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  const sampleEvents = [
    { date: "2026-03-05", label: "Sprint Planning", color: "#00ff41" },
    { date: "2026-03-12", label: "Deploy v2.4", color: "#00d4ff" },
    { date: "2026-03-18", label: "Board Meeting", color: "#ff6b35" },
    { date: "2026-03-22", label: "Product Launch", color: "#ff00ff" },
    { date: "2026-03-27", label: "Team Retro", color: "#00ff41" },
  ];

  const { Story } = defineMeta({
    title: "Data Display/Calendar",
    component: Calendar,
    tags: ["autodocs"],
    args: {
      selectedDate: todayISO,
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
      events: [],
      minDate: "",
      maxDate: "",
    },
  });
</script>

<Story name="Default" args={{ selectedDate: todayISO }} />

<Story name="WithEvents" args={{ selectedDate: "2026-03-12", month: 2, year: 2026, events: sampleEvents }} />

<Story name="DateRange" args={{ selectedDate: "2026-03-15", month: 2, year: 2026, minDate: "2026-03-10", maxDate: "2026-03-25" }} />
