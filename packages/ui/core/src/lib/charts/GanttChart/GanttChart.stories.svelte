<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import GanttChart from "./GanttChart.svelte";

  const { Story } = defineMeta({
    title: "Charts/GanttChart",
    component: GanttChart,
    tags: ["autodocs"],
  });

  const sprintPlanTasks = [
    { id: "auth", label: "Auth system", start: "2026-04-06", end: "2026-04-12", progress: 80, group: "Sprint 23", color: "var(--color-action-brand-default)" },
    { id: "contract", label: "Smart contract deploy", start: "2026-04-07", end: "2026-04-14", progress: 45, group: "Sprint 23", color: "var(--color-action-secondary-default)" },
    { id: "ml", label: "ML pipeline", start: "2026-04-08", end: "2026-04-16", progress: 60, group: "Sprint 23", color: "var(--color-action-tertiary-default)" },
    { id: "ui", label: "UI redesign", start: "2026-04-09", end: "2026-04-18", progress: 30, group: "Sprint 23", color: "var(--color-state-warning)" },
    { id: "testing", label: "Testing", start: "2026-04-17", end: "2026-04-23", progress: 0, group: "Sprint 24", dependencies: ["auth", "ml"], color: "var(--color-action-brand-default)" },
    { id: "review", label: "Code review", start: "2026-04-20", end: "2026-04-24", progress: 0, group: "Sprint 24", color: "var(--color-action-secondary-default)" },
    { id: "staging", label: "Deploy to staging", start: "2026-04-24", end: "2026-04-27", progress: 0, group: "Sprint 24", dependencies: ["testing"], color: "var(--color-action-tertiary-default)" },
    { id: "prod", label: "Production release", start: "2026-04-28", end: "2026-04-30", progress: 0, group: "Sprint 24", dependencies: ["staging"], color: "var(--color-state-success)" },
  ];

  const roadmapTasks = [
    { id: "dao", label: "CyberdyneDAO launch", start: "2026-04-01", end: "2026-04-30", progress: 75, group: "Q1", color: "var(--color-action-brand-default)" },
    { id: "yield", label: "YieldPath beta", start: "2026-04-15", end: "2026-05-20", progress: 40, group: "Q1", color: "var(--color-action-secondary-default)" },
    { id: "vision", label: "Vision Factory v2", start: "2026-05-01", end: "2026-05-31", progress: 10, group: "Q1", color: "var(--color-action-tertiary-default)" },
    { id: "governance", label: "Governance module", start: "2026-05-15", end: "2026-06-15", progress: 0, group: "Q2", color: "var(--color-state-warning)" },
    { id: "audit", label: "Security audit", start: "2026-06-01", end: "2026-06-20", progress: 0, group: "Q2", color: "var(--color-state-error)" },
    { id: "mainnet", label: "Mainnet deployment", start: "2026-06-15", end: "2026-06-30", progress: 0, group: "Q2", color: "var(--color-state-success)" },
  ];

  const depTasks = [
    { id: "design", label: "Design specs", start: "2026-04-01", end: "2026-04-07", progress: 100, color: "var(--color-action-brand-default)" },
    { id: "backend", label: "Backend API", start: "2026-04-08", end: "2026-04-18", progress: 60, dependencies: ["design"], color: "var(--color-action-secondary-default)" },
    { id: "frontend", label: "Frontend UI", start: "2026-04-10", end: "2026-04-20", progress: 40, dependencies: ["design"], color: "var(--color-action-tertiary-default)" },
    { id: "integration", label: "Integration", start: "2026-04-19", end: "2026-04-25", progress: 0, dependencies: ["backend", "frontend"], color: "var(--color-state-warning)" },
    { id: "qa", label: "QA & Release", start: "2026-04-25", end: "2026-04-30", progress: 0, dependencies: ["integration"], color: "var(--color-state-success)" },
  ];
</script>

<Story name="SprintPlan" args={{ tasks: sprintPlanTasks, zoom: "week", height: "420px" }} />

<Story name="Roadmap" args={{ tasks: roadmapTasks, zoom: "month", height: "380px" }} />

<Story name="WithDependencies" args={{ tasks: depTasks, zoom: "day", height: "320px", showDependencies: true }} />
