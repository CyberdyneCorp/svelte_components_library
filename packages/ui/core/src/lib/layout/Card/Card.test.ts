import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Card from "./Card.svelte";

describe("Card", () => {
  it("renders with default props", () => {
    const { container } = render(Card);
    const card = container.querySelector(".cy-card");
    expect(card).toBeInTheDocument();
  });

  it("applies variant class", () => {
    const { container } = render(Card, { props: { variant: "elevated" } });
    const card = container.querySelector(".cy-card");
    expect(card?.className).toContain("elevated");
  });

  it("applies padding class", () => {
    const { container } = render(Card, { props: { padding: "lg" } });
    const card = container.querySelector(".cy-card");
    expect(card?.className).toContain("pad-lg");
  });

  it("applies hoverable class when hoverable", () => {
    const { container } = render(Card, { props: { hoverable: true } });
    const card = container.querySelector(".cy-card");
    expect(card?.className).toContain("hoverable");
  });

  it("does not apply hoverable class by default", () => {
    const { container } = render(Card);
    const card = container.querySelector(".cy-card");
    expect(card?.className).not.toContain("hoverable");
  });
});
