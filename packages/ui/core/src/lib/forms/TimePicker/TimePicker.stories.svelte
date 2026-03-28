<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TimePicker from "./TimePicker.svelte";

  const { Story } = defineMeta({
    title: "Forms/TimePicker",
    component: TimePicker,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{
  label: "Meeting Time",
  value: "14:30",
}} />

<Story name="TwelveHour" args={{
  label: "Alarm",
  format: "12h",
  value: "09:00",
}} />

<Story name="WithStep" args={{
  label: "Interval",
  minuteStep: 15,
  value: "10:45",
}} />
