<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Clock from "./Clock.svelte";
  const { Story } = defineMeta({ title: "Retro/Clock", component: Clock, tags: ["autodocs"] });
</script>

<Story name="Default" args={{}} />
<Story name="WithDateAndSeconds" args={{ showDate: true, showSeconds: true }} />
<Story name="TwelveHour" args={{ hour12: true }} />
