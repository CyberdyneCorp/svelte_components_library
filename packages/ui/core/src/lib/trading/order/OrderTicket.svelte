<svelte:options runes={true} />

<script lang="ts">
  import MoneyInput from "../../forms/MoneyInput/MoneyInput.svelte";
  import { formatAmount } from "../../forms/MoneyInput/asset.js";
  import { formatPrice, pricePrecisionOf, sizePrecisionOf } from "../format.js";
  import type {
    MarginMode,
    MarketSpec,
    OrderDraft,
    OrderType,
    Side,
    TimeInForce,
  } from "../types.js";
  import LeverageSlider from "./LeverageSlider.svelte";
  import OrderPreview from "./OrderPreview.svelte";
  import SegmentedRadio from "./SegmentedRadio.svelte";
  import {
    DEFAULT_ORDER_TICKET_LABELS,
    type OrderTicketLabels,
    type OrderTicketLabelsInput,
  } from "./labels.js";
  import { previewOrder } from "./preview.js";
  import { convertSize, percentOfPower, sizeForPercent, type SizingContext } from "./sizing.js";
  import {
    entryPrice,
    needsPrice,
    needsTrigger,
    normalizeDraft,
    type SizeUnit,
    type TicketState,
  } from "./ticket.js";
  import { hasErrors, validateTicket, type TicketField } from "./validation.js";

  let {
    market,
    available = undefined,
    referencePrice = undefined,
    makerFee = undefined,
    takerFee = undefined,
    estimateLiquidation = undefined,
    onsubmit,
    labels = {},
    locale = undefined,
    quoteDecimals = undefined,
    side = $bindable("long"),
    type = $bindable("limit"),
    price = $bindable(null),
    leverage = $bindable(10),
    disabled = false,
    id = "",
  }: {
    market: MarketSpec;
    /** Available margin in the quote asset (decimal string). */
    available?: string;
    /** Mark or last price: the entry of market orders for preview and TP/SL checks. */
    referencePrice?: string;
    /** Fee rates as decimal fractions ("0.0002" = 0.02%). */
    makerFee?: string;
    takerFee?: string;
    /** Exchange-specific liquidation estimate for a valid, normalized draft. */
    estimateLiquidation?: (draft: OrderDraft) => string | undefined;
    /** Called with the normalized draft; the ticket never places orders itself. */
    onsubmit?: (draft: OrderDraft) => void;
    labels?: OrderTicketLabelsInput;
    locale?: string;
    /** Fraction digits of quote amounts; default max(2, price precision). */
    quoteDecimals?: number;
    side?: Side;
    type?: OrderType;
    /** Limit price; bindable so an order book click can fill it. */
    price?: string | null;
    leverage?: number;
    disabled?: boolean;
    id?: string;
  } = $props();

  const ORDER_TYPES: OrderType[] = ["market", "limit", "stop-market", "stop-limit"];
  const TIFS: TimeInForce[] = ["GTC", "IOC", "FOK"];
  const MODES: MarginMode[] = ["cross", "isolated"];
  const SIZE_FIELDS: TicketField[] = ["price", "triggerPrice", "size", "takeProfit", "stopLoss"];

  let triggerPrice = $state<string | null>(null);
  let size = $state<string | null>(null);
  let sizeUnit = $state<SizeUnit>("base");
  let marginMode = $state<MarginMode>("cross");
  let reduceOnly = $state(false);
  let postOnly = $state(false);
  let timeInForce = $state<TimeInForce>("GTC");
  let takeProfit = $state<string | null>(null);
  let stopLoss = $state<string | null>(null);
  let touched = $state<Partial<Record<TicketField, boolean>>>({});

  let text: OrderTicketLabels = $derived({
    ...DEFAULT_ORDER_TICKET_LABELS,
    ...labels,
    leverage: { ...DEFAULT_ORDER_TICKET_LABELS.leverage, ...labels.leverage },
  });
  let baseId = $derived(id || `cy-ot-${Math.random().toString(36).slice(2, 9)}`);
  let priceDecimals = $derived(pricePrecisionOf(market));
  let quoteDigits = $derived(quoteDecimals ?? Math.max(2, priceDecimals));

  let ticket: TicketState = $derived({
    side,
    type,
    price,
    triggerPrice,
    size,
    sizeUnit,
    leverage,
    marginMode,
    reduceOnly,
    postOnly,
    timeInForce,
    takeProfit,
    stopLoss,
  });

  let errors = $derived(
    validateTicket(ticket, { market, labels: text, available, referencePrice }),
  );
  let preview = $derived(
    previewOrder(ticket, { market, referencePrice, makerFee, takerFee, quoteDecimals: quoteDigits }),
  );
  let draft = $derived(hasErrors(errors) ? undefined : normalizeDraft(ticket, market, referencePrice));
  let liquidation = $derived(liquidationText(draft));

  let sizing: SizingContext = $derived({
    market,
    entry: entryPrice(ticket, referencePrice),
    available,
    leverage,
    quoteDecimals: quoteDigits,
  });
  let percent = $derived(percentOfPower(preview.notional, sizing));
  let percentDisabled = $derived(
    disabled || sizeForPercent(100, sizeUnit, sizing) === null,
  );

  function liquidationText(valid: OrderDraft | undefined): string | undefined {
    const estimate = valid && estimateLiquidation?.(valid);
    return estimate ? formatPrice(estimate, market, locale) : undefined;
  }

  function fieldValue(field: TicketField): string | null {
    const values = { price, triggerPrice, size, takeProfit, stopLoss };
    return field === "leverage" ? String(leverage) : values[field];
  }

  /** Errors show once the field has a value or has been left. */
  function shownError(field: TicketField): string {
    const visible = touched[field] || fieldValue(field) !== null;
    return (visible && errors[field]) || "";
  }

  function touch(field: TicketField) {
    touched[field] = true;
  }

  function changeUnit(next: SizeUnit) {
    size = convertSize(size, next, sizing);
    sizeUnit = next;
  }

  function handlePercent(event: Event) {
    const value = Number((event.currentTarget as HTMLInputElement).value);
    size = sizeForPercent(value, sizeUnit, sizing);
  }

  function submit(event: SubmitEvent) {
    event.preventDefault();
    if (draft === undefined) {
      for (const field of SIZE_FIELDS) touch(field);
      return;
    }
    onsubmit?.(draft);
  }

  let typeOptions = $derived(ORDER_TYPES.map((value) => ({ value, label: text.orderTypes[value] })));
  let sideOptions = $derived(
    (["long", "short"] as const).map((value) => ({ value, label: text.sides[value], tone: value })),
  );
</script>

<form
  class="cy-ot"
  aria-label={text.form}
  novalidate
  onsubmit={submit}
>
  <SegmentedRadio
    legend={text.side}
    name="{baseId}-side"
    size="lg"
    hideLegend
    options={sideOptions}
    bind:value={side}
    {disabled}
  />

  <SegmentedRadio
    legend={text.orderType}
    name="{baseId}-type"
    hideLegend
    options={typeOptions}
    bind:value={type}
    {disabled}
  />

  {#if needsTrigger(type)}
    <div onfocusout={() => touch("triggerPrice")}>
      <MoneyInput
        label={text.triggerPrice}
        currency={market.quoteAsset}
        decimals={priceDecimals}
        {locale}
        {disabled}
        bind:value={triggerPrice}
        error={shownError("triggerPrice")}
      />
    </div>
  {/if}

  {#if needsPrice(type)}
    <div onfocusout={() => touch("price")}>
      <MoneyInput
        label={text.price}
        currency={market.quoteAsset}
        decimals={priceDecimals}
        {locale}
        {disabled}
        bind:value={price}
        error={shownError("price")}
      />
    </div>
  {/if}

  <div class="cy-ot__size">
    <div onfocusout={() => touch("size")}>
      <MoneyInput
        label={text.size}
        currency={sizeUnit === "base" ? market.baseAsset : market.quoteAsset}
        decimals={sizeUnit === "base" ? sizePrecisionOf(market) : quoteDigits}
        {locale}
        {disabled}
        bind:value={size}
        error={shownError("size")}
      />
    </div>
    <SegmentedRadio
      legend={text.sizeUnit}
      name="{baseId}-unit"
      hideLegend
      options={[
        { value: "base", label: market.baseAsset },
        { value: "quote", label: market.quoteAsset },
      ]}
      value={sizeUnit}
      onchange={changeUnit}
      {disabled}
    />
  </div>

  <div class="cy-ot__percent">
    <input
      class="cy-ot__range"
      type="range"
      min="0"
      max="100"
      step="1"
      value={percent}
      disabled={percentDisabled}
      aria-label={text.sizePercent}
      aria-valuetext={text.percent(percent)}
      oninput={handlePercent}
    />
    {#if available !== undefined}
      <p class="cy-ot__available">
        <span>{text.available}</span>
        <span class="cy-ot__mono">
          {formatAmount(available, { currency: market.quoteAsset, decimals: quoteDigits, locale })}
        </span>
      </p>
    {/if}
  </div>

  <LeverageSlider
    bind:value={leverage}
    max={market.maxLeverage}
    labels={text.leverage}
    error={errors.leverage ?? ""}
    {disabled}
  />

  <SegmentedRadio
    legend={text.marginMode}
    name="{baseId}-mode"
    options={MODES.map((value) => ({ value, label: text.marginModes[value] }))}
    bind:value={marginMode}
    {disabled}
  />

  {#if needsPrice(type)}
    <SegmentedRadio
      legend={text.timeInForce}
      name="{baseId}-tif"
      options={TIFS.map((value) => ({ value, label: text.timeInForceOptions[value] }))}
      bind:value={timeInForce}
      {disabled}
    />
  {/if}

  <div class="cy-ot__flags">
    <label class="cy-ot__check">
      <input type="checkbox" bind:checked={reduceOnly} {disabled} />
      {text.reduceOnly}
    </label>
    {#if type === "limit"}
      <label class="cy-ot__check">
        <input type="checkbox" bind:checked={postOnly} {disabled} />
        {text.postOnly}
      </label>
    {/if}
  </div>

  <div class="cy-ot__exits">
    <div onfocusout={() => touch("takeProfit")}>
      <MoneyInput
        label={text.takeProfit}
        currency={market.quoteAsset}
        decimals={priceDecimals}
        {locale}
        {disabled}
        bind:value={takeProfit}
        error={shownError("takeProfit")}
      />
    </div>
    <div onfocusout={() => touch("stopLoss")}>
      <MoneyInput
        label={text.stopLoss}
        currency={market.quoteAsset}
        decimals={priceDecimals}
        {locale}
        {disabled}
        bind:value={stopLoss}
        error={shownError("stopLoss")}
      />
    </div>
  </div>

  <OrderPreview
    {preview}
    labels={text}
    quoteAsset={market.quoteAsset}
    quoteDecimals={quoteDigits}
    {locale}
    {liquidation}
    showLiquidation={estimateLiquidation !== undefined}
  />

  <button
    class="cy-ot__submit cy-ot__submit--{side}"
    type="submit"
    disabled={disabled || draft === undefined}
  >
    {text.submit(side, type)}
  </button>
</form>

<style>
  .cy-ot {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    width: 100%;
    max-width: 360px;
    padding: var(--space-4);
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    color: var(--color-text-primary);
  }

  .cy-ot__size {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .cy-ot__percent {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .cy-ot__range {
    width: 100%;
    margin: 0;
    accent-color: var(--color-border-focus);
    cursor: pointer;
  }

  .cy-ot__range:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cy-ot__available {
    display: flex;
    justify-content: space-between;
    margin: 0;
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  .cy-ot__mono {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    color: var(--color-text-primary);
  }

  .cy-ot__flags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
  }

  .cy-ot__check {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-text-primary);
    cursor: pointer;
  }

  .cy-ot__check input {
    width: 16px;
    height: 16px;
    margin: 0;
    accent-color: var(--color-border-focus);
  }

  .cy-ot__exits {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2);
  }

  .cy-ot__submit {
    min-height: 44px;
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: var(--font-weight-semibold);
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    cursor: pointer;
  }

  .cy-ot__submit--long {
    color: var(--color-trade-long-text);
    background: var(--color-trade-long-bg);
    border-color: var(--color-trade-long);
  }

  .cy-ot__submit--short {
    color: var(--color-trade-short-text);
    background: var(--color-trade-short-bg);
    border-color: var(--color-trade-short);
  }

  .cy-ot__submit:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .cy-ot__submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
