<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PromoBanner from "./PromoBanner.svelte";
  import PriceTag from "../../data/PriceTag/PriceTag.svelte";
  import Button from "../../primitives/Button/Button.svelte";
  import Icon from "../../primitives/Icon/Icon.svelte";

  const { Story } = defineMeta({
    title: "Feedback/PromoBanner",
    component: PromoBanner,
    tags: ["autodocs"],
    parameters: {
      a11y: { test: "error" },
      docs: {
        description: {
          component:
            'Dismissible upsell or announcement with an optional price and call to action. Renders `role="region"` labelled by its title; use `Alert` for status messages. Dismissal calls `ondismiss` and hides the banner; persisting it is up to the application.',
        },
      },
    },
  });
</script>

<Story
  name="Default"
  args={{
    title: "Try the new dashboard",
    description: "A faster overview of every server and domain.",
  }}
/>

<Story name="BackupUpsell" asChild>
  <PromoBanner
    title="Faça upgrade para backups diários"
    description="Snapshots automáticos com retenção de 30 dias para todos os seus servidores."
    dismissible
    dismissLabel="Fechar"
  >
    {#snippet icon()}<Icon name="shield" size={20} />{/snippet}
    {#snippet price()}
      <PriceTag
        amount="19.90"
        originalAmount="39.90"
        currency="BRL"
        locale="pt-BR"
        period="/mês"
        savings="Economize 50%"
        originalLabel="Preço original"
        size="sm"
      />
    {/snippet}
    {#snippet actions()}
      <Button variant="brand" size="sm">Fazer Upgrade</Button>
    {/snippet}
  </PromoBanner>
</Story>

<Story name="WithActionsOnly" asChild>
  <PromoBanner
    title="Two-factor authentication is available"
    description="Protect your account with an authenticator app."
  >
    {#snippet icon()}<Icon name="lock" size={20} />{/snippet}
    {#snippet actions()}
      <Button variant="outline" size="sm">Learn more</Button>
      <Button variant="brand" size="sm">Enable</Button>
    {/snippet}
  </PromoBanner>
</Story>

<Story name="Narrow" asChild>
  <div style="max-width: 390px;">
    <PromoBanner
      title="Upgrade to daily backups"
      description="Automatic snapshots with 30-day retention."
      dismissible
    >
      {#snippet price()}
        <PriceTag amount="4.99" currency="USD" locale="en-US" period="/month" size="sm" />
      {/snippet}
      {#snippet actions()}
        <Button variant="brand" size="sm">Upgrade</Button>
      {/snippet}
    </PromoBanner>
  </div>
</Story>
