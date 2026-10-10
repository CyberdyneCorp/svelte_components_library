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

  it("renders a non-last crumb without href as plain text, not a link", () => {
    render(Breadcrumb, { props: { items: [{ label: "Root" }, { label: "Leaf" }] } });
    const root = screen.getByText("Root");
    expect(root.closest("a")).toBeNull();
    expect(root).not.toHaveAttribute("aria-current");
    expect(screen.getByText("Leaf")).toHaveAttribute("aria-current", "page");
  });

  describe("item icons", () => {
    const consoleItems = [
      { label: "Início", href: "/", icon: "home", iconOnly: true },
      { label: "VPS", href: "/vps" },
      { label: "Docker" },
    ];

    it("renders the home crumb as a link named by its hidden label with an icon", () => {
      render(Breadcrumb, { props: { items: consoleItems } });
      const link = screen.getByRole("link", { name: "Início" });
      expect(link).toHaveAttribute("href", "/");
      const svg = link.querySelector("svg.cy-icon");
      expect(svg).toHaveAttribute("aria-hidden", "true");
      const label = screen.getByText("Início");
      expect(label).toHaveClass("cy-breadcrumb__sr-only");
      expect(svg?.compareDocumentPosition(label)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it("marks the last crumb as the current page alongside an icon-only home crumb", () => {
      render(Breadcrumb, { props: { items: consoleItems } });
      expect(screen.getByText("Docker")).toHaveAttribute("aria-current", "page");
      expect(screen.getByRole("link", { name: "VPS" })).toHaveAttribute("href", "/vps");
    });

    it("renders the icon before a visible label when iconOnly is not set", () => {
      render(Breadcrumb, {
        props: {
          items: [{ label: "Servers", href: "/servers", icon: "cpu" }, { label: "web-01" }],
        },
      });
      const link = screen.getByRole("link", { name: "Servers" });
      expect(link.querySelector("svg.cy-icon")).toBeInTheDocument();
      expect(link.querySelector(".cy-breadcrumb__sr-only")).toBeNull();
      expect(link).toHaveTextContent("Servers");
    });

    it("ignores iconOnly without an icon so the label stays visible", () => {
      render(Breadcrumb, {
        props: { items: [{ label: "Bare", href: "/", iconOnly: true }, { label: "End" }] },
      });
      const link = screen.getByRole("link", { name: "Bare" });
      expect(link.querySelector(".cy-breadcrumb__sr-only")).toBeNull();
      expect(link.querySelector("svg")).toBeNull();
    });

    it("renders items without icon exactly as before", () => {
      const { container } = render(Breadcrumb, { props: { items } });
      expect(container.querySelector("svg.cy-icon")).toBeNull();
      expect(container.querySelector(".cy-breadcrumb__sr-only")).toBeNull();
    });
  });
});
