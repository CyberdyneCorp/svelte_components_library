<svelte:options runes={true} />

<script lang="ts">
  import type { Position } from "../types.js";
  import TradeTable from "./TradeTable.svelte";
  import { DEFAULT_POSITIONS_LABELS, type PositionsTableLabels } from "./labels.js";
  import { pnlTone, priceCell, quoteAmount, sizeCell, type Markets } from "./tableFormat.js";

  let {
    positions = [],
    markets = {},
    labels = {},
    locale = undefined,
    quoteDecimals = 2,
    onclose = undefined,
    onedittpsl = undefined,
  }: {
    positions?: Position[];
    /** Market rules keyed by `Position.market`, used for price / size precision. */
    markets?: Markets;
    labels?: Partial<PositionsTableLabels>;
    locale?: string;
    /** Fraction digits of margin and PnL (quote amounts). */
    quoteDecimals?: number;
    /** Close intent; the table does not change until `positions` changes. */
    onclose?: (position: Position, kind: "market" | "limit") => void;
    onedittpsl?: (position: Position) => void;
  } = $props();

  let text = $derived({ ...DEFAULT_POSITIONS_LABELS, ...labels });
  let hasActions = $derived(onclose !== undefined || onedittpsl !== undefined);
  let columnCount = $derived(hasActions ? 10 : 9);

  function price(position: Position, value: string | undefined): string {
    return priceCell(value, markets[position.market], locale) ?? text.none;
  }

  function roe(position: Position): string {
    return position.roe === undefined ? "" : ` (${quoteAmount(position.roe, 2, locale, true)}%)`;
  }
</script>

<TradeTable caption={text.caption}>
  <thead>
    <tr>
      <th scope="col">{text.market}</th>
      <th scope="col">{text.side}</th>
      <th scope="col" class="cy-tt__num">{text.size}</th>
      <th scope="col" class="cy-tt__num">{text.entryPrice}</th>
      <th scope="col" class="cy-tt__num">{text.markPrice}</th>
      <th scope="col" class="cy-tt__num">{text.liquidationPrice}</th>
      <th scope="col" class="cy-tt__num">{text.margin}</th>
      <th scope="col" class="cy-tt__num">{text.unrealizedPnl}</th>
      <th scope="col" class="cy-tt__num">{text.tpsl}</th>
      {#if hasActions}<th scope="col"><span class="cy-tt__muted">{text.actions}</span></th>{/if}
    </tr>
  </thead>
  <tbody>
    {#each positions as position (position.id)}
      {@const market = markets[position.market]}
      {@const tone = pnlTone(position.unrealizedPnl)}
      <tr data-position={position.id}>
        <th scope="row">{position.market}</th>
        <td class="cy-tt__{position.side}">
          {text.sides[position.side]} {text.leverage(position.leverage)}
        </td>
        <td class="cy-tt__num">{sizeCell(position.size, market, locale)}</td>
        <td class="cy-tt__num">{price(position, position.entryPrice)}</td>
        <td class="cy-tt__num">{price(position, position.markPrice)}</td>
        <td class="cy-tt__num">{price(position, position.liquidationPrice)}</td>
        <td class="cy-tt__num">
          {quoteAmount(position.margin, quoteDecimals, locale)}
          <span class="cy-tt__muted">({text.marginModes[position.marginMode]})</span>
        </td>
        <td class="cy-tt__num" class:cy-tt__long={tone === "long"} class:cy-tt__short={tone === "short"}>
          {quoteAmount(position.unrealizedPnl, quoteDecimals, locale, true)}{roe(position)}
        </td>
        <td class="cy-tt__num">
          {price(position, position.takeProfit)} / {price(position, position.stopLoss)}
        </td>
        {#if hasActions}
          <td>
            <div class="cy-tt__actions" role="group" aria-label={text.rowActions(position.market, text.sides[position.side])}>
              {#if onclose}
                <button type="button" class="cy-tt__button" onclick={() => onclose?.(position, "market")}>
                  {text.closeMarket}
                </button>
                <button type="button" class="cy-tt__button" onclick={() => onclose?.(position, "limit")}>
                  {text.closeLimit}
                </button>
              {/if}
              {#if onedittpsl}
                <button type="button" class="cy-tt__button" onclick={() => onedittpsl?.(position)}>
                  {text.editTpsl}
                </button>
              {/if}
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
