<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import CurrencyDisplay from "./CurrencyDisplay.svelte";

  const { Story } = defineMeta({
    title: "Data/CurrencyDisplay",
    component: CurrencyDisplay,
    tags: ["autodocs"],
    argTypes: {
      signDisplay: {
        control: "select",
        options: ["auto", "always", "exceptZero", "negative", "never"],
      },
      currencyDisplay: { control: "select", options: ["symbol", "narrowSymbol", "code", "name"] },
      tone: { control: "inline-radio", options: ["neutral", "signed"] },
    },
  });

  /** Real-browser check: masking must not change the rendered width. */
  async function assertMaskKeepsWidth({ canvasElement }: { canvasElement: HTMLElement }) {
    const [plain, masked] = Array.from(canvasElement.querySelectorAll<HTMLElement>(".cy-currency"));
    await expect(getComputedStyle(plain).fontVariantNumeric).toBe("tabular-nums");
    await expect(masked.getBoundingClientRect().width).toBeCloseTo(
      plain.getBoundingClientRect().width,
      1,
    );
  }
</script>

<Story name="Default" args={{ amount: "1234.56", currency: "USD", locale: "en-US" }} />

<Story name="Locales">
  {#snippet template()}
    <div style="display: grid; gap: var(--space-2); justify-items: end;">
      <CurrencyDisplay amount="1234.56" currency="USD" locale="en-US" />
      <CurrencyDisplay amount="1234.56" currency="EUR" locale="de-DE" />
      <CurrencyDisplay amount="1234.56" currency="BRL" locale="pt-BR" />
      <CurrencyDisplay amount="1500" currency="JPY" locale="ja-JP" />
      <CurrencyDisplay amount="1234.567" currency="BHD" locale="en-US" currencyDisplay="code" />
    </div>
  {/snippet}
</Story>

<Story name="NegativeSigned">
  {#snippet template()}
    <div style="display: grid; gap: var(--space-2); justify-items: end;">
      <CurrencyDisplay
        amount="2500.00"
        currency="USD"
        locale="en-US"
        tone="signed"
        signDisplay="exceptZero"
      />
      <CurrencyDisplay
        amount="-845.10"
        currency="USD"
        locale="en-US"
        tone="signed"
        signDisplay="exceptZero"
      />
      <CurrencyDisplay
        amount="0"
        currency="USD"
        locale="en-US"
        tone="signed"
        signDisplay="exceptZero"
      />
      <CurrencyDisplay
        amount="-845.10"
        currency="USD"
        locale="en-US"
        tone="signed"
        signDisplay="never"
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Masked"
  args={{
    amount: "98765.43",
    currency: "USD",
    locale: "en-US",
    masked: true,
    maskedLabel: "Balance hidden",
  }}
/>

<Story name="InvalidAmount" args={{ amount: "not-a-number", currency: "USD", locale: "en-US" }} />

<Story name="MaskedKeepsWidth" play={assertMaskKeepsWidth}>
  {#snippet template()}
    <div style="display: grid; gap: var(--space-2); justify-items: start;">
      <CurrencyDisplay amount="-98765.43" currency="USD" locale="en-US" />
      <CurrencyDisplay amount="-98765.43" currency="USD" locale="en-US" masked />
    </div>
  {/snippet}
</Story>
