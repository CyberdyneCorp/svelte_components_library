import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import ShoppingCartPanel from "./ShoppingCartPanel.svelte";

const items = [
  { id: "a", title: "Service A", price: 10 },
  { id: "b", title: "Service B", price: 20, qty: 2 },
];

describe("ShoppingCartPanel", () => {
  it("shows empty state when no items", () => {
    render(ShoppingCartPanel);
    expect(screen.getByText("Your bag is empty")).toBeInTheDocument();
  });
  it("renders default header count 0 when empty", () => {
    render(ShoppingCartPanel);
    expect(screen.getByText("YOUR BAG (0)")).toBeInTheDocument();
  });
  it("computes count from qty sum", () => {
    render(ShoppingCartPanel, { props: { items } });
    expect(screen.getByText("YOUR BAG (3)")).toBeInTheDocument();
  });
  it("computes total", () => {
    render(ShoppingCartPanel, { props: { items } });
    expect(screen.getByTestId("cy-cart-total")).toHaveTextContent("$50.00");
  });
  it("supports custom currency", () => {
    render(ShoppingCartPanel, { props: { items, currency: "€" } });
    expect(screen.getByTestId("cy-cart-total")).toHaveTextContent("€50.00");
  });
  it("renders each item title", () => {
    render(ShoppingCartPanel, { props: { items } });
    expect(screen.getByText("Service A")).toBeInTheDocument();
    expect(screen.getByText("Service B")).toBeInTheDocument();
  });
  it("fires onCheckout", async () => {
    const onCheckout = vi.fn();
    render(ShoppingCartPanel, { props: { items, onCheckout } });
    await fireEvent.click(screen.getByText("Checkout"));
    expect(onCheckout).toHaveBeenCalled();
  });
  it("fires onRemove with id", async () => {
    const onRemove = vi.fn();
    render(ShoppingCartPanel, { props: { items, onRemove } });
    await fireEvent.click(screen.getByLabelText("Remove Service A"));
    expect(onRemove).toHaveBeenCalledWith("a");
  });
  it("omits remove button when onRemove not provided", () => {
    render(ShoppingCartPanel, { props: { items } });
    expect(screen.queryByLabelText("Remove Service A")).not.toBeInTheDocument();
  });
  it("renders suggestions", () => {
    render(ShoppingCartPanel, {
      props: { suggestions: [{ id: "s", title: "Services", subtitle: "Custom dev" }] },
    });
    expect(screen.getByText("Services")).toBeInTheDocument();
    expect(screen.getByText("Custom dev")).toBeInTheDocument();
  });
  it("fires onSuggestionClick", async () => {
    const onSuggestionClick = vi.fn();
    render(ShoppingCartPanel, {
      props: { suggestions: [{ id: "s", title: "S" }], onSuggestionClick },
    });
    await fireEvent.click(screen.getByText("S"));
    expect(onSuggestionClick).toHaveBeenCalledWith("s");
  });
  it("uses aria-label from title", () => {
    render(ShoppingCartPanel, { props: { title: "BASKET" } });
    expect(screen.getByRole("complementary", { name: "BASKET" })).toBeInTheDocument();
  });
});
