import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import BreadcrumbOverflow from "./BreadcrumbOverflow.svelte";

const items = [
  { label: "Home", href: "/" },
  { label: "Category", href: "/cat" },
  { label: "Sub", href: "/sub" },
  { label: "Deep", href: "/deep" },
  { label: "Item", href: "/item" },
  { label: "Current" },
];

describe("BreadcrumbOverflow", () => {
  it("renders navigation with aria-label", () => {
    render(BreadcrumbOverflow, { props: { items } });
    expect(screen.getByLabelText("Breadcrumb")).toBeInTheDocument();
  });

  it("shows ellipsis when items exceed maxVisible", () => {
    render(BreadcrumbOverflow, { props: { items, maxVisible: 4 } });
    const ellipsis = screen.getByRole("button", { name: /\u2026/ });
    expect(ellipsis).toBeInTheDocument();
  });

  it("renders first and last items always visible", () => {
    render(BreadcrumbOverflow, { props: { items, maxVisible: 4 } });
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
  });

  it("shows dropdown when ellipsis clicked", async () => {
    render(BreadcrumbOverflow, { props: { items, maxVisible: 4 } });
    const ellipsis = screen.getByRole("button", { name: /\u2026/ });
    await fireEvent.click(ellipsis);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("renders all items without overflow when under maxVisible", () => {
    const shortItems = [
      { label: "Home", href: "/" },
      { label: "Current" },
    ];
    render(BreadcrumbOverflow, { props: { items: shortItems, maxVisible: 4 } });
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
  });
});
