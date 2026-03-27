<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import DateRangePicker from "./DateRangePicker.svelte";

  const { Story } = defineMeta({
    title: "Forms/DateRangePicker",
    component: DateRangePicker,
    tags: ["autodocs"],
  });

  const presets = [
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 90 days", days: 90 },
    { label: "Last year", days: 365 },
  ];
</script>

<Story name="Default" args={{ label: "Date Range" }} />

<Story name="WithPresets" args={{ label: "Report Period", presets }} />

<Story name="WithError" args={{ label: "Date Range", error: "Please select a valid date range" }} />
