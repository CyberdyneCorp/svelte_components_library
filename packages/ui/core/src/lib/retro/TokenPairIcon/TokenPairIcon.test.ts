import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import TokenPairIcon from "./TokenPairIcon.svelte";

describe("TokenPairIcon", () => {
  it("renders img role", () => {
    render(TokenPairIcon, { props: { tokenA: "ETH", tokenB: "USDC" } });
    expect(screen.getByRole("img")).toBeInTheDocument();
  });
  it("uses pair as accessible label by default", () => {
    render(TokenPairIcon, { props: { tokenA: "ETH", tokenB: "USDC" } });
    expect(screen.getByLabelText("ETH/USDC")).toBeInTheDocument();
  });
  it("uses custom ariaLabel", () => {
    render(TokenPairIcon, { props: { tokenA: "A", tokenB: "B", ariaLabel: "My Pair" } });
    expect(screen.getByLabelText("My Pair")).toBeInTheDocument();
  });
  it("renders initials when no icon src", () => {
    render(TokenPairIcon, { props: { tokenA: "ETH", tokenB: "USDC" } });
    expect(screen.getByTestId("cy-tpair-a")).toHaveTextContent("ET");
    expect(screen.getByTestId("cy-tpair-b")).toHaveTextContent("US");
  });
  it("handles short symbols", () => {
    render(TokenPairIcon, { props: { tokenA: "A", tokenB: "B" } });
    expect(screen.getByTestId("cy-tpair-a")).toHaveTextContent("A");
  });
  it("renders icon images when provided", () => {
    const { container } = render(TokenPairIcon, {
      props: { tokenA: "A", tokenB: "B", tokenAIconSrc: "/a.png", tokenBIconSrc: "/b.png" },
    });
    const imgs = container.querySelectorAll("img");
    expect(imgs).toHaveLength(2);
    expect(imgs[0].getAttribute("src")).toBe("/a.png");
  });
  it("applies size via CSS var", () => {
    render(TokenPairIcon, { props: { tokenA: "A", tokenB: "B", size: 40 } });
    expect(screen.getByTestId("cy-tpair").style.getPropertyValue("--cy-tpair-size")).toBe("40px");
  });
  it("applies custom colors", () => {
    render(TokenPairIcon, { props: { tokenA: "A", tokenB: "B", tokenAColor: "#ff0000", tokenBColor: "#00ff00" } });
    expect(screen.getByTestId("cy-tpair-a").style.background).toBe("rgb(255, 0, 0)");
    expect(screen.getByTestId("cy-tpair-b").style.background).toBe("rgb(0, 255, 0)");
  });
});
