import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import AllocationBreakdown from "./AllocationBreakdown.svelte";
import { allocationWidth } from "./types.js";

const props = {
  ariaLabel: "Distribuição",
  locale: "pt-BR",
  description: "Percentuais sobre patrimônio líquido; barras mostram magnitudes relativas.",
};

describe("AllocationBreakdown", () => {
  it("preserves signed and over-100 percentages and exposes the denominator", () => {
    const { container } = render(AllocationBreakdown, {
      props: {
        ...props,
        items: [
          { id: "assets", label: "Ativos", percentage: 120, value: "R$ 120", tone: "info" },
          { id: "debt", label: "Dívidas", percentage: -20, value: "−R$ 20", tone: "negative" },
        ],
      },
    });
    const region = screen.getByRole("region", { name: "Distribuição" });
    expect(region).toContainElement(screen.getByText(props.description));
    expect(screen.getByText("120%")).toBeInTheDocument();
    expect(screen.getByText("-20%")).toBeInTheDocument();
    expect(screen.getByText("−R$ 20")).toBeInTheDocument();
    const bars = container.querySelectorAll<HTMLElement>(".cy-allocation__bar");
    expect(bars[0].style.width).toBe("50%");
    expect(bars[1].style.left).not.toBe("50%");
    expect(bars[1]).toHaveClass("cy-allocation__bar--negative");
    expect(bars[0].parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("distinguishes zero from unavailable and never emits invalid geometry", () => {
    const { container } = render(AllocationBreakdown, {
      props: {
        ...props,
        unavailableLabel: "Indisponível",
        items: [
          { id: "zero", label: "Zero", percentage: 0, value: "R$ 0" },
          { id: "nan", label: "Sem preço", percentage: NaN, value: "—" },
          { id: "infinity", label: "Inválido", percentage: Infinity, value: "—" },
        ],
      },
    });
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getAllByText("Indisponível")).toHaveLength(2);
    for (const bar of container.querySelectorAll<HTMLElement>(".cy-allocation__bar")) {
      expect(bar.style.width).toBe("0%");
      expect(bar.style.left).toBe("50%");
    }
  });

  it("supports translated empty data", () => {
    render(AllocationBreakdown, { props: { ...props, emptyLabel: "Nenhuma posição" } });
    expect(screen.getByText("Nenhuma posição")).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("updates geometry when its data changes", async () => {
    const { container, rerender } = render(AllocationBreakdown, {
      props: { ...props, items: [{ id: "one", label: "Um", percentage: 1, value: "1" }] },
    });
    await rerender({ ...props, items: [{ id: "one", label: "Um", percentage: -1, value: "-1" }] });
    expect(container.querySelector<HTMLElement>(".cy-allocation__bar")?.style.left).toBe("0%");
  });

  it("handles very large finite magnitudes without multiplication overflow", () => {
    expect(allocationWidth(Number.MAX_VALUE, Number.MAX_VALUE)).toBe(50);
    expect(allocationWidth(-25, 100)).toBe(12.5);
    expect(allocationWidth(0, 0)).toBe(0);
  });
});
