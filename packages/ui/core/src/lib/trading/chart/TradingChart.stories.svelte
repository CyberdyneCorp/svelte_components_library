<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import TradingChart from "./TradingChart.svelte";
  import TradingChartLinesDemo from "../../_testdata/TradingChartLinesDemo.svelte";
  import TradingChartLiveDemo from "../../_testdata/TradingChartLiveDemo.svelte";
  import TradingChartThemeDemo from "../../_testdata/TradingChartThemeDemo.svelte";
  import { BTC_PERP, HOUR, marketCandles } from "../../_testdata/tradingData.js";

  const { Story } = defineMeta({
    title: "Trading/TradingChart",
    component: TradingChart,
    tags: ["autodocs"],
    parameters: {
      a11y: { test: "error" },
      docs: {
        description: {
          component:
            "Canvas candlestick chart on the library's own engine: candles, hollow candles, OHLC bars, line and area series, volume, overlay and sub-pane indicators, trade markers, draggable price lines and live updates. Focus it and use ←/→ (crosshair), Shift+←/→ (pan), +/− (zoom), Home/End; L selects a draggable price line, ↑/↓ move it by a tick (Shift: ten), Enter applies and Escape cancels; drag to pan, wheel or pinch to zoom, double-click to reset.",
        },
      },
    },
    argTypes: {
      seriesType: { control: "select", options: ["candles", "hollow", "bars", "line", "area"] },
      volume: { control: "select", options: ["overlay", "pane", "none"] },
      scaleMode: { control: "select", options: ["linear", "log"] },
      timeZone: { control: "text" },
    },
  });

  /** Keyboard alternative to dragging: L selects the TP line, ↑ moves it one tick, Enter applies. */
  async function keyboardPriceLine({ canvasElement }: { canvasElement: HTMLElement }) {
    const canvas = within(canvasElement);
    const note = canvas.getByText(/TP [\d.]+/);
    const before = Number(/TP ([\d.]+)/.exec(note.textContent ?? "")![1]);
    const chart = canvas.getByRole("img", { name: /^Price chart/ });
    chart.focus();
    await userEvent.keyboard("l{ArrowUp}{Enter}");
    await waitFor(() => expect(note.textContent).toContain(`TP ${before + 0.5}`));
    await waitFor(() => expect(canvasElement.querySelector("[aria-live='polite']")?.textContent).toMatch(/^TP set to /));
  }

  const candles = marketCandles(500);
  const daily = marketCandles(400, { interval: 24 * HOUR, seed: 9, volatility: 0.03 });
  const big = marketCandles(100_000, { interval: 60_000, seed: 13, volatility: 0.002 });
</script>

<Story name="Basic" args={{ candles, market: BTC_PERP, interval: "1h" }} />

<Story name="Hollow candles" args={{ candles, market: BTC_PERP, seriesType: "hollow" }} />

<Story name="OHLC bars" args={{ candles, market: BTC_PERP, seriesType: "bars", volume: "pane" }} />

<Story name="Line" args={{ candles, market: BTC_PERP, seriesType: "line", volume: "none" }} />

<Story name="Area" args={{ candles, market: BTC_PERP, seriesType: "area" }} />

<Story
  name="Log scale, daily, New York time"
  exportName="LogScaleDaily"
  args={{ candles: daily, market: BTC_PERP, scaleMode: "log", timeZone: "America/New_York" }}
/>

<Story
  name="Indicators"
  args={{
    candles,
    market: BTC_PERP,
    height: 560,
    indicators: [
      { type: "ema", period: 9 },
      { type: "ema", period: 21 },
      { type: "sma", period: 200 },
      { type: "rsi", period: 14 },
      { type: "macd" },
    ],
  }}
/>

<Story
  name="All indicators"
  args={{
    candles,
    market: BTC_PERP,
    height: 720,
    volume: "pane",
    indicators: [
      { type: "wma", period: 30 },
      { type: "bollinger", period: 20, stdDev: 2 },
      { type: "vwap" },
      { type: "atr" },
      { type: "adx" },
      { type: "stochastic", kPeriod: 14, smoothK: 3, dPeriod: 3 },
    ],
  }}
/>

<Story name="Markers and price lines" asChild play={keyboardPriceLine}>
  <TradingChartLinesDemo />
</Story>

<Story name="Live feed" asChild>
  <TradingChartLiveDemo />
</Story>

<!-- asChild keeps the 100k bars out of Storybook's serialized args. -->
<Story name="100k candles" exportName="Candles100k" asChild>
  <TradingChart
    candles={big}
    market={BTC_PERP}
    interval="1m"
    indicators={[{ type: "ema", period: 50 }, { type: "rsi" }]}
  />
</Story>

<Story name="Theme switching" asChild>
  <TradingChartThemeDemo />
</Story>

<Story
  name="Localized (pt-BR)"
  exportName="LocalizedPtBr"
  args={{
    candles,
    market: BTC_PERP,
    locale: "pt-BR",
    timeZone: "America/Sao_Paulo",
    indicators: [{ type: "ema", period: 21 }],
    labels: {
      chart: "Gráfico de preço",
      summary: "{chart}: {symbol} {interval}, de {from} a {to}. Último fechamento {close} ({change}).",
      keyboardHint: "Setas movem a mira; Shift+setas deslocam; + e − ampliam; Home e End vão ao início e ao fim.",
      announcement: "{time}: abertura {open}, máxima {high}, mínima {low}, fechamento {close}, volume {volume}{indicators}",
      showData: "Mostrar dados",
      hideData: "Ocultar dados",
      tableCaption: "Últimas {count} barras",
      columns: { time: "Hora", open: "Abertura", high: "Máxima", low: "Mínima", close: "Fechamento", volume: "Volume" },
      legend: { open: "A", high: "Máx", low: "Mín", close: "F", volume: "V" },
      priceLines: { entry: "Entrada", "take-profit": "Alvo", "stop-loss": "Stop", liquidation: "Liq." },
    },
  }}
/>
