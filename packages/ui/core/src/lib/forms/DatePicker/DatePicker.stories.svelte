<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import DatePicker from "./DatePicker.svelte";

  const { Story } = defineMeta({
    title: "Forms/DatePicker",
    component: DatePicker,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ placeholder: "Select date" }} />

<Story name="WithLabel" args={{
  label: "Start Date",
  placeholder: "YYYY-MM-DD",
  value: "2026-03-28",
}} />

<Story name="WithMinMax" args={{
  label: "Booking Date",
  placeholder: "Select date",
  minDate: "2026-03-01",
  maxDate: "2026-03-31",
}} />
