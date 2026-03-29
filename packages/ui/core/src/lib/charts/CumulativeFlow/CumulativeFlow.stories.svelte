<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CumulativeFlow from "./CumulativeFlow.svelte";

  const { Story } = defineMeta({
    title: "Charts/CumulativeFlow",
    component: CumulativeFlow,
    tags: ["autodocs"],
  });

  const defaultStatuses = [
    { key: "backlog", label: "Backlog" },
    { key: "inProgress", label: "In Progress" },
    { key: "review", label: "Review" },
    { key: "done", label: "Done" },
  ];

  const defaultData = [
    { date: "2026-03-01", backlog: 30, inProgress: 5, review: 2, done: 0 },
    { date: "2026-03-08", backlog: 22, inProgress: 8, review: 4, done: 3 },
    { date: "2026-03-15", backlog: 15, inProgress: 7, review: 5, done: 10 },
    { date: "2026-03-22", backlog: 8, inProgress: 5, review: 3, done: 21 },
    { date: "2026-03-28", backlog: 3, inProgress: 3, review: 2, done: 29 },
  ];

  const longTermData = [
    { date: "2026-01-04", backlog: 50, inProgress: 3, review: 1, done: 0 },
    { date: "2026-01-11", backlog: 46, inProgress: 5, review: 2, done: 1 },
    { date: "2026-01-18", backlog: 42, inProgress: 6, review: 3, done: 3 },
    { date: "2026-01-25", backlog: 38, inProgress: 7, review: 3, done: 6 },
    { date: "2026-02-01", backlog: 34, inProgress: 6, review: 4, done: 10 },
    { date: "2026-02-08", backlog: 30, inProgress: 5, review: 3, done: 16 },
    { date: "2026-02-15", backlog: 26, inProgress: 7, review: 2, done: 19 },
    { date: "2026-02-22", backlog: 22, inProgress: 5, review: 4, done: 23 },
    { date: "2026-03-01", backlog: 18, inProgress: 4, review: 3, done: 29 },
    { date: "2026-03-08", backlog: 13, inProgress: 6, review: 2, done: 33 },
    { date: "2026-03-15", backlog: 8, inProgress: 4, review: 3, done: 39 },
    { date: "2026-03-22", backlog: 3, inProgress: 2, review: 1, done: 48 },
  ];
</script>

<Story name="Default" args={{ data: defaultData, statuses: defaultStatuses }} />

<Story name="LongTerm" args={{ data: longTermData, statuses: defaultStatuses, xLabel: "Week", yLabel: "Items" }} />
