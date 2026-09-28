import { render, screen, fireEvent } from "@testing-library/svelte";
import { beforeAll, describe, it, expect } from "vitest";
import type { Component } from "svelte";
import AreaChart from "./AreaChart/AreaChart.svelte";
import BarChart from "./BarChart/BarChart.svelte";
import Gauge from "./Gauge/Gauge.svelte";
import LineChart from "./LineChart/LineChart.svelte";
import PieChart from "./PieChart/PieChart.svelte";
import SankeyChart from "./SankeyChart/SankeyChart.svelte";
import ScatterChart from "./ScatterChart/ScatterChart.svelte";
import Sparkline from "./Sparkline/Sparkline.svelte";
import TreeMap from "./TreeMap/TreeMap.svelte";

/**
 * Every chart's user-visible and assistive strings can be localized through
 * `labels` (issue: CyberWealth is pt-BR by default and its i18n gate rejects
 * untranslated strings). Each case passes pt-BR strings and checks the table
 * headers, toggle text, caption and accessible name.
 */

// TreeMap measures its container; jsdom has no ResizeObserver.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

const series = [{ name: "Receita", data: [{ x: 1, y: 10 }, { x: 2, y: 20 }] }];
const twoSeries = [...series, { name: "Despesa", data: [{ x: 1, y: 5 }, { x: 2, y: 8 }] }];
const categories = [
  { label: "Moradia", value: 60 },
  { label: "Lazer", value: 40 },
];

type Case = {
  name: string;
  component: Component<any>;
  props: Record<string, unknown>;
  columns: Record<string, string>;
  expectedHeaders: string[];
  chart: string;
  toggle?: boolean;
};

const CASES: Case[] = [
  { name: "LineChart", component: LineChart, props: { series }, columns: { x: "Mês" }, expectedHeaders: ["Mês", "Receita"], chart: "Gráfico de linhas" },
  { name: "AreaChart", component: AreaChart, props: { series }, columns: { x: "Mês" }, expectedHeaders: ["Mês", "Receita"], chart: "Gráfico de área" },
  { name: "BarChart", component: BarChart, props: { data: categories }, columns: { label: "Categoria", value: "Valor" }, expectedHeaders: ["Categoria", "Valor"], chart: "Gráfico de barras" },
  { name: "PieChart", component: PieChart, props: { data: categories }, columns: { label: "Categoria", value: "Valor", share: "Parcela" }, expectedHeaders: ["Categoria", "Valor", "Parcela"], chart: "Gráfico de pizza" },
  { name: "TreeMap", component: TreeMap, props: { data: categories }, columns: { label: "Categoria", value: "Valor", share: "Parcela" }, expectedHeaders: ["Categoria", "Valor", "Parcela"], chart: "Mapa de árvore" },
  {
    name: "SankeyChart",
    component: SankeyChart,
    props: { nodes: [{ id: "a", label: "Salário" }, { id: "b", label: "Moradia" }], links: [{ source: "a", target: "b", value: 100 }] },
    columns: { source: "Origem", target: "Destino", value: "Valor" },
    expectedHeaders: ["Origem", "Destino", "Valor"],
    chart: "Diagrama de fluxo",
  },
  { name: "ScatterChart", component: ScatterChart, props: { series }, columns: { series: "Série", x: "Eixo X", y: "Eixo Y" }, expectedHeaders: ["Série", "Eixo X", "Eixo Y"], chart: "Gráfico de dispersão" },
  { name: "Sparkline", component: Sparkline, props: { data: [1, 2, 3], showDataToggle: true }, columns: { point: "Ponto", value: "Valor" }, expectedHeaders: ["Ponto", "Valor"], chart: "Minigráfico" },
  { name: "Gauge", component: Gauge, props: { value: 40, showDataToggle: true }, columns: { measure: "Medida", value: "Valor", minimum: "Mínimo", maximum: "Máximo" }, expectedHeaders: ["Medida", "Valor", "Mínimo", "Máximo"], chart: "Medidor" },
];

function columnHeaderTexts(): string[] {
  return [...document.querySelectorAll("thead th")].map((th) => th.textContent ?? "");
}

describe.each(CASES)("$name labels", ({ component, props, columns, expectedHeaders, chart }) => {
  const labels = { chart, columns, tableCaption: "Dados do gráfico", showData: "Mostrar dados", hideData: "Ocultar dados" };

  it("localizes the data-table column headers and caption", () => {
    render(component, { props: { ...props, labels } });
    expect(columnHeaderTexts()).toEqual(expectedHeaders);
    expect(document.querySelector("caption")?.textContent).toBe("Dados do gráfico");
  });

  it("localizes the show/hide data toggle", async () => {
    render(component, { props: { ...props, labels } });
    const toggle = screen.getByRole("button", { name: "Mostrar dados" });
    await fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Ocultar dados" })).toBeInTheDocument();
  });

  it("uses labels.chart as the accessible name when there is no title", () => {
    render(component, { props: { ...props, labels } });
    const img = document.querySelector("svg[role=img]");
    expect(img?.getAttribute("aria-label")).toContain(chart);
  });

  it("keeps the English defaults when labels is omitted", () => {
    render(component, { props });
    expect(document.querySelector("caption")?.textContent).toMatch(/ data$/);
  });
});

describe("legend labels", () => {
  it.each([
    ["LineChart", LineChart, { series }],
    ["AreaChart", AreaChart, { series }],
    ["PieChart", PieChart, { data: categories }],
    ["ScatterChart", ScatterChart, { series: twoSeries }],
  ] as const)("%s names the legend with labels.legend", (_name, component, props) => {
    render(component as Component<any>, { props: { ...props, labels: { legend: "Legenda" } } });
    expect(screen.getByRole("list", { name: "Legenda" })).toBeInTheDocument();
  });
});
