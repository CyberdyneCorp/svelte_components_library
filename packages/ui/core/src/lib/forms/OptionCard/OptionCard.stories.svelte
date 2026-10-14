<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import OptionCard from "./OptionCard.svelte";
  import Icon from "../../primitives/Icon/Icon.svelte";
  import Badge from "../../primitives/Badge/Badge.svelte";

  const { Story } = defineMeta({
    title: "Forms/OptionCard",
    component: OptionCard,
    tags: ["autodocs"],
    parameters: {
      a11y: { test: "error" },
    },
  });

  const plans = [
    { value: "free", title: "Free", description: "1 project, community support", price: "$0" },
    { value: "pro", title: "Pro", description: "Unlimited projects, email support", price: "$12/mo" },
    { value: "team", title: "Team", description: "SSO, audit log, priority support", price: "$40/mo" },
  ];

  // Native radio keyboard behaviour: arrows move and select within the group.
  async function keyboardFlow({ canvasElement }: { canvasElement: HTMLElement }) {
    const canvas = within(canvasElement);
    const free = canvas.getByRole("radio", { name: "Free" });
    free.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("radio", { name: "Pro" })).toBeChecked();
    await expect(canvas.getByTestId("selected-plan")).toHaveTextContent("pro");
  }

  async function checkboxFlow({ canvasElement }: { canvasElement: HTMLElement }) {
    const canvas = within(canvasElement);
    const backups = canvas.getByRole("checkbox", { name: "Daily backups" });
    backups.focus();
    await userEvent.keyboard(" ");
    await expect(backups).toBeChecked();
  }
</script>

<script lang="ts">
  let plan = $state("free");
  let backups = $state(false);
  let monitoring = $state(true);
</script>

<Story name="Plan picker" asChild play={keyboardFlow}>
  <fieldset style="border: 0; padding: 0; margin: 0; display: grid; gap: 0.75rem; max-width: 520px;">
    <legend style="margin-bottom: 0.75rem;">Plan</legend>
    {#each plans as option (option.value)}
      <OptionCard name="plan" value={option.value} title={option.title} description={option.description} bind:group={plan}>
        {#snippet meta()}{option.price}{/snippet}
      </OptionCard>
    {/each}
  </fieldset>
  <p>Selected: <span data-testid="selected-plan">{plan}</span></p>
</Story>

<Story name="Checkbox cards" asChild play={checkboxFlow}>
  <div style="display: grid; gap: 0.75rem; max-width: 520px;">
    <OptionCard type="checkbox" title="Daily backups" description="Kept for 7 days" bind:checked={backups}>
      {#snippet icon()}<Icon name="cloud" />{/snippet}
    </OptionCard>
    <OptionCard type="checkbox" title="Uptime monitoring" description="Checks every minute from 3 regions" bind:checked={monitoring}>
      {#snippet icon()}<Icon name="activity" />{/snippet}
      {#snippet meta()}<Badge variant="info">Beta</Badge>{/snippet}
    </OptionCard>
  </div>
</Story>

<Story name="Grid with disabled option" asChild>
  <fieldset style="border: 0; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem;">
    <legend style="margin-bottom: 0.75rem;">Region</legend>
    <OptionCard name="region" value="sao" title="São Paulo" description="sa-east-1" group="sao" />
    <OptionCard name="region" value="fra" title="Frankfurt" description="eu-central-1" />
    <OptionCard name="region" value="syd" title="Sydney" description="Coming soon" disabled />
  </fieldset>
</Story>
