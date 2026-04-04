import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
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

  it("applies outlined variant class", () => {
    const { container } = render(Card, { props: { variant: "outlined" } });
    const card = container.querySelector(".cy-card");
    expect(card?.className).toContain("outlined");
  });

  it("applies small padding class", () => {
    const { container } = render(Card, { props: { padding: "sm" } });
    const card = container.querySelector(".cy-card");
    expect(card?.className).toContain("pad-sm");
  });

  it("applies default padding class (md)", () => {
    const { container } = render(Card);
    const card = container.querySelector(".cy-card");
    expect(card?.className).toContain("pad-md");
  });

  it("applies hoverable class when onclick is provided", () => {
    const handler = vi.fn();
    const { container } = render(Card, { props: { onclick: handler } });
    const card = container.querySelector(".cy-card");
    expect(card?.className).toContain("hoverable");
  });

  it("sets role=button when onclick is provided", () => {
    const handler = vi.fn();
    const { container } = render(Card, { props: { onclick: handler } });
    const card = container.querySelector(".cy-card");
    expect(card).toHaveAttribute("role", "button");
  });

  it("sets tabindex=0 when onclick is provided", () => {
    const handler = vi.fn();
    const { container } = render(Card, { props: { onclick: handler } });
    const card = container.querySelector(".cy-card");
    expect(card).toHaveAttribute("tabindex", "0");
  });

  it("does not set role or tabindex without onclick", () => {
    const { container } = render(Card);
    const card = container.querySelector(".cy-card");
    expect(card).not.toHaveAttribute("role");
    expect(card).not.toHaveAttribute("tabindex");
  });

  it("fires onclick handler when clicked", async () => {
    const handler = vi.fn();
    const { container } = render(Card, { props: { onclick: handler } });
    const card = container.querySelector(".cy-card")!;
    await fireEvent.click(card);
    expect(handler).toHaveBeenCalledOnce();
  });

  it("applies default variant class", () => {
    const { container } = render(Card);
    const card = container.querySelector(".cy-card");
    expect(card?.className).toContain("cy-card--default");
  });
});
