<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ScheduleConfig from "./ScheduleConfig.svelte";

  const { Story } = defineMeta({
    title: "Forms/ScheduleConfig",
    component: ScheduleConfig,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" />

<Story name="WithLabel" args={{ label: "Agent Schedule" }} />

<Story
  name="IntervalMode"
  args={{
    label: "Run frequency",
    value: {
      mode: "interval",
      intervalMinutes: 30,
      time: "09:00",
      days: [1, 2, 3, 4, 5],
      monthDays: [1],
      cron: "0 9 * * *",
      timezone: "UTC",
    },
  }}
/>

<Story
  name="WeeklyMode"
  args={{
    label: "Agent Schedule",
    value: {
      mode: "weekly",
      intervalMinutes: 60,
      time: "09:00",
      days: [1, 3, 5],
      monthDays: [1],
      cron: "",
      timezone: "America/New_York",
    },
  }}
/>

<Story
  name="DailyMode"
  args={{
    label: "Daily Check-in",
    value: {
      mode: "daily",
      intervalMinutes: 60,
      time: "08:00",
      days: [],
      monthDays: [],
      cron: "",
      timezone: "Europe/London",
    },
  }}
/>

<Story
  name="MonthlyMode"
  args={{
    label: "Monthly Report",
    value: {
      mode: "monthly",
      intervalMinutes: 60,
      time: "06:00",
      days: [],
      monthDays: [1, 15],
      cron: "",
      timezone: "UTC",
    },
  }}
/>

<Story
  name="WithCron"
  args={{
    label: "Advanced Schedule",
    showCron: true,
    value: {
      mode: "cron",
      intervalMinutes: 60,
      time: "09:00",
      days: [],
      monthDays: [],
      cron: "0 9 * * 1-5",
      timezone: "UTC",
    },
  }}
/>

<Story name="WithError" args={{ label: "Schedule", error: "At least one day must be selected" }} />

<Story name="Disabled" args={{ label: "Schedule (locked)", disabled: true }} />
