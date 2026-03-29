import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import ConfusionMatrix from "./ConfusionMatrix.svelte";

describe("ConfusionMatrix", () => {
  const matrix = [
    [50, 5],
    [3, 42],
  ];
  const labels = ["Cat", "Dog"];

  it("renders with default props", () => {
    render(ConfusionMatrix);
    const el = document.querySelector(".cy-cm");
    expect(el).toBeInTheDocument();
  });

  it("displays the title", () => {
    render(ConfusionMatrix, { props: { title: "Test Matrix" } });
    expect(screen.getByText("Test Matrix")).toBeInTheDocument();
  });

  it("renders labels", () => {
    render(ConfusionMatrix, { props: { matrix, labels } });
    const allCat = screen.getAllByText("Cat");
    expect(allCat.length).toBeGreaterThanOrEqual(1);
  });

  it("shows cell values when showValues is true", () => {
    render(ConfusionMatrix, { props: { matrix, labels, showValues: true } });
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("displays axis labels", () => {
    render(ConfusionMatrix, { props: { matrix, labels } });
    expect(screen.getByText("Actual")).toBeInTheDocument();
    expect(screen.getByText("Predicted")).toBeInTheDocument();
  });
});
