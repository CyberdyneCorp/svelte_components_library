import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import { createRawSnippet } from "svelte";
import PromoBanner from "./PromoBanner.svelte";

const price = createRawSnippet(() => ({
  render: () => `<span data-testid="price">R$ 10,99</span>`,
}));
const actions = createRawSnippet(() => ({
  render: () => `<button type="button">Fazer Upgrade</button>`,
}));
const icon = createRawSnippet(() => ({
  render: () => `<svg data-testid="icon"></svg>`,
}));

const upsell = {
  title: "Faça upgrade para backups diários",
  description: "Proteja seus dados com snapshots automáticos.",
  price,
  actions,
  dismissible: true,
  dismissLabel: "Fechar",
};

describe("PromoBanner", () => {
  it("renders a region named by the title containing price, actions and the dismiss button", () => {
    render(PromoBanner, { props: upsell });
    const region = screen.getByRole("region", { name: "Faça upgrade para backups diários" });
    expect(region).toContainElement(screen.getByTestId("price"));
    expect(region).toContainElement(screen.getByRole("button", { name: "Fazer Upgrade" }));
    expect(region).toContainElement(screen.getByRole("button", { name: "Fechar" }));
    expect(screen.getByRole("button", { name: "Fechar" })).toHaveClass("cy-icon-btn");
    expect(region).toHaveTextContent("Proteja seus dados com snapshots automáticos.");
  });

  it("calls ondismiss once and removes the region when the dismiss button is clicked", async () => {
    const ondismiss = vi.fn();
    render(PromoBanner, { props: { ...upsell, ondismiss } });
    await fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    expect(ondismiss).toHaveBeenCalledOnce();
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("is a region, never an alert or status live region", () => {
    const { container } = render(PromoBanner, { props: upsell });
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
    expect(container.querySelector("[aria-live]")).toBeNull();
  });

  it("renders no dismiss button by default", () => {
    render(PromoBanner, { props: { title: "Try the new dashboard" } });
    expect(screen.getByRole("region", { name: "Try the new dashboard" })).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("defaults the dismiss label to English", () => {
    render(PromoBanner, { props: { title: "Offer", dismissible: true } });
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });

  it("renders the icon snippet hidden from assistive technology", () => {
    render(PromoBanner, { props: { title: "Offer", icon } });
    expect(screen.getByTestId("icon").parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("omits description, price and actions containers when not provided", () => {
    const { container } = render(PromoBanner, { props: { title: "Offer" } });
    expect(container.querySelector(".cy-promo__description")).toBeNull();
    expect(container.querySelector(".cy-promo__price")).toBeNull();
    expect(container.querySelector(".cy-promo__actions")).toBeNull();
    expect(container.querySelector(".cy-promo__icon")).toBeNull();
  });
});
