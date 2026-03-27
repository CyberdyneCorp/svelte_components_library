<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import DateRangePicker from "./DateRangePicker.svelte";

  const { Story } = defineMeta({
    title: "Forms/DateRangePicker",
    component: DateRangePicker,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <DateRangePicker label="Date Range" />
</Story>

<Story name="WithPresets">
  <DateRangePicker
    label="Report Period"
    presets={[
      { label: "Last 7 days", days: 7 },
      { label: "Last 30 days", days: 30 },
      { label: "Last 90 days", days: 90 },
      { label: "Last year", days: 365 },
    ]}
  />
</Story>

<Story name="WithError">
  <DateRangePicker label="Date Range" error="Please select a valid date range" />
</Story>
