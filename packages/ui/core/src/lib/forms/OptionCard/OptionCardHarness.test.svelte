<script lang="ts">
  import OptionCard from "./OptionCard.svelte";

  let { plan = $bindable("free"), onchange }: { plan?: string; onchange?: (checked: boolean) => void } = $props();
</script>

<fieldset>
  <legend>Plan</legend>
  <OptionCard name="plan" value="free" title="Free" description="1 project" bind:group={plan} />
  <OptionCard name="plan" value="pro" title="Pro" description="Unlimited projects" bind:group={plan} {onchange}>
    {#snippet meta()}$12/mo{/snippet}
  </OptionCard>
  <OptionCard name="plan" value="team" title="Team" bind:group={plan} disabled />
</fieldset>
<output data-testid="plan">{plan}</output>
