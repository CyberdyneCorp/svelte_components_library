import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import StatCard from "./StatCard.svelte";

describe("StatCard", () => {
  it("renders title", () => {
    render(StatCard, { props: { title: "Treasury" } });
    expect(screen.getByText("Treasury")).toBeInTheDocument();
  });
  it("uses title as accessible label", () => {
    render(StatCard, { props: { title: "Treasury" } });
    expect(screen.getByRole("region", { name: "Treasury" })).toBeInTheDocument();
  });
  it("renders icon when provided", () => {
    render(StatCard, { props: { title: "T", icon: "💰" } });
    expect(screen.getByText("💰")).toBeInTheDocument();
  });
  it("renders primary value", () => {
    render(StatCard, { props: { title: "T", primary: "$3,840,977.80" } });
    expect(screen.getByText("$3,840,977.80")).toBeInTheDocument();
  });
  it("renders primary numeric value (zero)", () => {
    render(StatCard, { props: { title: "T", primary: 0 } });
    expect(screen.getByTestId("cy-statcard-primary")).toHaveTextContent("0");
  });
  it("omits primary when undefined", () => {
    const { container } = render(StatCard, { props: { title: "T" } });
    expect(container.querySelector(".cy-statcard__primary")).not.toBeInTheDocument();
  });
  it.each(["brand", "info", "success", "danger", "default"] as const)("applies %s primary accent", (accent) => {
    const { container } = render(StatCard, { props: { title: "T", primary: 1, primaryAccent: accent } });
    expect(container.querySelector(`.cy-statcard__primary--${accent}`)).toBeInTheDocument();
  });
  it("renders rows", () => {
    render(StatCard, { props: { title: "T", rows: [
      { label: "ETH", value: "1,247.83" },
      { label: "USDC", value: "425,780" },
    ] } });
    expect(screen.getByText("ETH")).toBeInTheDocument();
    expect(screen.getByText("1,247.83")).toBeInTheDocument();
    expect(screen.getByText("USDC")).toBeInTheDocument();
  });
  it("applies row accent class", () => {
    const { container } = render(StatCard, { props: { title: "T", rows: [
      { label: "Profit", value: "100", accent: "brand" },
    ] } });
    expect(container.querySelector(".cy-statcard__val--brand")).toBeInTheDocument();
  });
  it("uses default accent when row accent missing", () => {
    const { container } = render(StatCard, { props: { title: "T", rows: [{ label: "x", value: "y" }] } });
    expect(container.querySelector(".cy-statcard__val--default")).toBeInTheDocument();
  });
  it("does not render rows container when empty", () => {
    const { container } = render(StatCard, { props: { title: "T" } });
    expect(container.querySelector(".cy-statcard__rows")).not.toBeInTheDocument();
  });
});
