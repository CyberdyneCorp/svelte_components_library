<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import AgingWIP from "./AgingWIP.svelte";

  const { Story } = defineMeta({
    title: "Charts/AgingWIP",
    component: AgingWIP,
    tags: ["autodocs"],
  });

  const defaultItems = [
    { id: "1", title: "Auth service refactor", status: "In Progress", daysInProgress: 12, assignee: "Alice" },
    { id: "2", title: "Dashboard redesign", status: "In Review", daysInProgress: 8, assignee: "Bob" },
    { id: "3", title: "API rate limiting", status: "In Progress", daysInProgress: 6, assignee: "Charlie" },
    { id: "4", title: "Fix login redirect", status: "In Progress", daysInProgress: 4, assignee: "Diana" },
    { id: "5", title: "Add search filters", status: "In Review", daysInProgress: 3, assignee: "Eve" },
    { id: "6", title: "Update dependencies", status: "In Progress", daysInProgress: 2 },
    { id: "7", title: "Write migration script", status: "In Progress", daysInProgress: 15, assignee: "Frank" },
    { id: "8", title: "Setup CI pipeline", status: "In Review", daysInProgress: 1 },
  ];

  const highAgingItems = [
    { id: "1", title: "Legacy DB migration", status: "In Progress", daysInProgress: 28, assignee: "Alice" },
    { id: "2", title: "Auth v2 rewrite", status: "In Progress", daysInProgress: 22, assignee: "Bob" },
    { id: "3", title: "Compliance audit fixes", status: "In Review", daysInProgress: 18, assignee: "Charlie" },
    { id: "4", title: "Performance tuning", status: "In Progress", daysInProgress: 14, assignee: "Diana" },
    { id: "5", title: "API versioning", status: "In Progress", daysInProgress: 11 },
    { id: "6", title: "Cache invalidation", status: "In Review", daysInProgress: 9, assignee: "Eve" },
    { id: "7", title: "Logging overhaul", status: "In Progress", daysInProgress: 6, assignee: "Frank" },
    { id: "8", title: "Add health checks", status: "In Progress", daysInProgress: 3 },
  ];
</script>

<Story name="Default" args={{ items: defaultItems }} />

<Story name="HighAging" args={{ items: highAgingItems, warningThreshold: 7, criticalThreshold: 14 }} />
