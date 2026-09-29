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
  it("leaves the ring backgrounds to the --tpair-a-bg / --tpair-b-bg tokens by default", () => {
    render(TokenPairIcon, { props: { tokenA: "A", tokenB: "B" } });
    expect(screen.getByTestId("cy-tpair-a").style.background).toBe("");
    expect(screen.getByTestId("cy-tpair-b").style.background).toBe("");
  });
  it("maxInitials limits the initials length", () => {
    render(TokenPairIcon, { props: { tokenA: "WETH", tokenB: "usdc", maxInitials: 3 } });
    expect(screen.getByTestId("cy-tpair-a")).toHaveTextContent(/^WET$/);
    expect(screen.getByTestId("cy-tpair-b")).toHaveTextContent(/^USD$/);
  });
  it("maxInitials=1 shows one letter", () => {
    render(TokenPairIcon, { props: { tokenA: "WETH", tokenB: "USDC", maxInitials: 1 } });
    expect(screen.getByTestId("cy-tpair-a")).toHaveTextContent(/^W$/);
    expect(screen.getByTestId("cy-tpair-b")).toHaveTextContent(/^U$/);
  });
  it("defaults to two initials", () => {
    render(TokenPairIcon, { props: { tokenA: "WETH", tokenB: "USDC" } });
    expect(screen.getByTestId("cy-tpair-a")).toHaveTextContent(/^WE$/);
  });
  it("showInitials=false renders plain discs but keeps the accessible label", () => {
    render(TokenPairIcon, { props: { tokenA: "WETH", tokenB: "USDC", showInitials: false } });
    expect(screen.getByTestId("cy-tpair-a")).toHaveTextContent(/^$/);
    expect(screen.getByTestId("cy-tpair-b")).toHaveTextContent(/^$/);
    expect(screen.getByRole("img", { name: "WETH/USDC" })).toBeInTheDocument();
  });
  it("icons still win over initials", () => {
    const { container } = render(TokenPairIcon, {
      props: { tokenA: "A", tokenB: "B", tokenAIconSrc: "/a.png", showInitials: true },
    });
    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(screen.getByTestId("cy-tpair-b")).toHaveTextContent("B");
  });
});
