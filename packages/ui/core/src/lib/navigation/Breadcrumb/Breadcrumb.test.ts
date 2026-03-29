import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Breadcrumb from "./Breadcrumb.svelte";

const items = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Detail" },
];

describe("Breadcrumb", () => {
  it("renders navigation with aria-label", () => {
    render(Breadcrumb, { props: { items } });
    expect(screen.getByLabelText("Breadcrumb")).toBeInTheDocument();
  });

  it("renders all breadcrumb items", () => {
    render(Breadcrumb, { props: { items } });
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Detail")).toBeInTheDocument();
  });

  it("renders links for non-last items with href", () => {
    render(Breadcrumb, { props: { items } });
    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("marks last item as current page", () => {
    render(Breadcrumb, { props: { items } });
    const detail = screen.getByText("Detail");
    expect(detail).toHaveAttribute("aria-current", "page");
  });

  it("renders separators between items", () => {
    const { container } = render(Breadcrumb, { props: { items } });
    const separators = container.querySelectorAll('[aria-hidden="true"]');
    expect(separators.length).toBe(2);
  });
});
