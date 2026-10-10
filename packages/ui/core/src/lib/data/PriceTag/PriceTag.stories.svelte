<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PriceTag from "./PriceTag.svelte";

  const { Story } = defineMeta({
    title: "Data Display/PriceTag",
    component: PriceTag,
    tags: ["autodocs"],
    parameters: {
      a11y: { test: "error" },
      docs: {
        description: {
          component:
            "Current price with an optional struck original price, billing period and savings badge. Both prices render through `CurrencyDisplay` from decimal strings; the struck price is preceded by a visually hidden `originalLabel` so screen readers do not read two prices as one.",
        },
      },
    },
  });
</script>

<Story
  name="Default"
  args={{ amount: "29.00", currency: "USD", locale: "en-US", period: "/month" }}
/>

<Story
  name="Discounted"
  args={{
    amount: "10.99",
    originalAmount: "103.99",
    currency: "BRL",
    locale: "pt-BR",
    period: "/1º ano",
    savings: "Economize 89%",
    originalLabel: "Preço original",
  }}
/>

<Story name="Sizes" asChild>
  <div style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;">
    <PriceTag
      amount="4.50"
      originalAmount="9.00"
      currency="EUR"
      locale="de-DE"
      period="/Monat"
      savings="-50%"
      size="sm"
    />
    <PriceTag
      amount="4.50"
      originalAmount="9.00"
      currency="EUR"
      locale="de-DE"
      period="/Monat"
      savings="-50%"
      size="md"
    />
    <PriceTag
      amount="4.50"
      originalAmount="9.00"
      currency="EUR"
      locale="de-DE"
      period="/Monat"
      savings="-50%"
      size="lg"
    />
  </div>
</Story>

<Story
  name="WithoutOriginal"
  args={{ amount: "120.00", currency: "GBP", locale: "en-GB", period: "/year", size: "lg" }}
/>
