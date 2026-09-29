<svelte:options runes={true} />

<script lang="ts">
  import type { OpenOrder } from "../types.js";
  import TradeTable from "./TradeTable.svelte";
  import { DEFAULT_OPEN_ORDERS_LABELS, type OpenOrdersTableLabels } from "./labels.js";
  import { priceCell, sizeCell, timeCell, type Markets } from "./tableFormat.js";

  let {
    orders = [],
    markets = {},
    labels = {},
    locale = undefined,
    formatTime = undefined,
    oncancel = undefined,
    oncancelall = undefined,
  }: {
    orders?: OpenOrder[];
    /** Market rules keyed by `OpenOrder.market`, used for price / size precision. */
    markets?: Markets;
    labels?: Partial<OpenOrdersTableLabels>;
    locale?: string;
    /** Formats `createdAt` (UTC ms); defaults to a short locale date and time. */
    formatTime?: (time: number) => string;
    /** Cancel intent; the table does not change until `orders` changes. */
    oncancel?: (order: OpenOrder) => void;
    oncancelall?: () => void;
  } = $props();

  let text = $derived({ ...DEFAULT_OPEN_ORDERS_LABELS, ...labels });
  let columnCount = $derived(oncancel ? 10 : 9);

  function priceText(order: OpenOrder): string {
    const market = markets[order.market];
    const limit = priceCell(order.price, market, locale);
    const trigger = priceCell(order.triggerPrice, market, locale);
    const parts = [trigger && text.trigger(trigger), limit ?? (trigger ? undefined : text.marketPrice)];
    return parts.filter(Boolean).join(" · ");
  }

  function time(order: OpenOrder): string {
    return formatTime ? formatTime(order.createdAt) : timeCell(order.createdAt, locale);
  }
</script>

<TradeTable caption={text.caption}>
  {#snippet toolbar()}
    {#if oncancelall && orders.length > 0}
      <button type="button" class="cy-tt__button" onclick={() => oncancelall?.()}>
        {text.cancelAll}
      </button>
    {/if}
  {/snippet}
  <thead>
    <tr>
      <th scope="col">{text.market}</th>
      <th scope="col">{text.side}</th>
      <th scope="col">{text.type}</th>
      <th scope="col" class="cy-tt__num">{text.price}</th>
      <th scope="col" class="cy-tt__num">{text.size}</th>
      <th scope="col" class="cy-tt__num">{text.filled}</th>
      <th scope="col">{text.reduceOnly}</th>
      <th scope="col">{text.timeInForce}</th>
      <th scope="col">{text.time}</th>
      {#if oncancel}<th scope="col"><span class="cy-tt__muted">{text.actions}</span></th>{/if}
    </tr>
  </thead>
  <tbody>
    {#each orders as order (order.id)}
      {@const market = markets[order.market]}
      <tr data-order={order.id}>
        <th scope="row">{order.market}</th>
        <td class="cy-tt__{order.side}">{text.sides[order.side]}</td>
        <td>{text.orderTypes[order.type]}</td>
        <td class="cy-tt__num">{priceText(order)}</td>
        <td class="cy-tt__num">{sizeCell(order.size, market, locale)}</td>
        <td class="cy-tt__num">{sizeCell(order.filled, market, locale)}</td>
        <td>{order.reduceOnly ? text.yes : text.no}</td>
        <td>{order.timeInForce}</td>
        <td class="cy-tt__muted">
          <time datetime={new Date(order.createdAt).toISOString()}>{time(order)}</time>
        </td>
        {#if oncancel}
          <td>
            <div class="cy-tt__actions">
              <button
                type="button"
                class="cy-tt__button"
                aria-label={text.cancelOrder(
                  order.market,
                  text.sides[order.side],
                  text.orderTypes[order.type],
                )}
                onclick={() => oncancel?.(order)}
              >
                {text.cancel}
              </button>
            </div>
          </td>
        {/if}
      </tr>
    {:else}
      <tr>
        <td class="cy-tt__empty" colspan={columnCount}>{text.empty}</td>
      </tr>
    {/each}
  </tbody>
</TradeTable>
