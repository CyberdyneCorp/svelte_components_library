<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Timestamp from "./Timestamp.svelte";

  const { Story } = defineMeta({
    title: "Data/Timestamp",
    component: Timestamp,
    tags: ["autodocs"],
    parameters: {
      a11y: { test: "error" },
    },
    argTypes: {
      format: { control: "inline-radio", options: ["relative", "absolute", "both"] },
    },
  });

  // Fixed reference time keeps stories and visual snapshots deterministic.
  const now = new Date("2026-10-14T12:00:00Z");
  const ago = (ms: number) => new Date(now.getTime() - ms);
  const MIN = 60_000;
  const examples = [
    { label: "Deployed", value: ago(20_000) },
    { label: "Last login", value: ago(3 * MIN) },
    { label: "Updated", value: ago(5 * 60 * MIN) },
    { label: "Created", value: ago(26 * 60 * MIN) },
    { label: "Expires", value: ago(-14 * 24 * 60 * MIN) },
  ];
</script>

<Story name="Relative" args={{ value: ago(3 * MIN), now, locale: "en" }} />

<Story name="Absolute" args={{ value: now, now, format: "absolute", locale: "en-US", timeZone: "UTC" }} />

<Story name="Both" args={{ value: ago(90 * MIN), now, format: "both", locale: "en-US", timeZone: "UTC" }} />

<!-- Hover any value to see the absolute time in its title. -->
<Story name="In a list" asChild>
  <dl style="display: grid; grid-template-columns: max-content 1fr; gap: 0.5rem 1rem; margin: 0;">
    {#each examples as example (example.label)}
      <dt>{example.label}</dt>
      <dd style="margin: 0;"><Timestamp value={example.value} {now} locale="en" /></dd>
    {/each}
  </dl>
</Story>

<Story name="Localized (pt-BR)" args={{ value: ago(24 * 60 * MIN), now, locale: "pt-BR" }} />

<Story name="Invalid value" args={{ value: "not a date" }} />
