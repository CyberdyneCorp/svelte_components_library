import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import NavBar from "./NavBar.svelte";

const items = [
  { label: "Home", href: "/home" },
  { label: "About", href: "/about", active: true },
  {
    label: "Products",
    children: [
      { label: "Widget", href: "/products/widget", description: "A widget", icon: "W" },
      { label: "Gadget", href: "/products/gadget" },
    ],
  },
];

describe("NavBar", () => {
  it("renders with nav element and aria-label", () => {
    render(NavBar, { props: { items } });
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByLabelText("Main navigation")).toBeInTheDocument();
  });

  it("renders brand label", () => {
    render(NavBar, { props: { items, brand: { label: "MyApp" } } });
    expect(screen.getByText("MyApp")).toBeInTheDocument();
  });

  it("renders brand with icon", () => {
    render(NavBar, { props: { items, brand: { label: "MyApp", icon: "X" } } });
    expect(screen.getByText("X")).toBeInTheDocument();
  });

  it("renders all nav items", () => {
    render(NavBar, { props: { items } });
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
  });

  it("marks active item", () => {
    const { container } = render(NavBar, { props: { items } });
    const activeLink = container.querySelector(".cy-navbar__link--active");
    expect(activeLink).toBeInTheDocument();
    expect(activeLink?.textContent).toContain("About");
  });

  it("opens dropdown on click", async () => {
    render(NavBar, { props: { items } });
    await fireEvent.click(screen.getByText("Products"));
    expect(screen.getByText("Widget")).toBeInTheDocument();
    expect(screen.getByText("Gadget")).toBeInTheDocument();
  });

  it("closes dropdown on second click", async () => {
    render(NavBar, { props: { items } });
    await fireEvent.click(screen.getByText("Products"));
    expect(screen.getByText("Widget")).toBeInTheDocument();
    await fireEvent.click(screen.getByText("Products"));
    expect(screen.queryByText("Widget")).not.toBeInTheDocument();
  });

  it("shows child description and icon", async () => {
    render(NavBar, { props: { items } });
    await fireEvent.click(screen.getByText("Products"));
    expect(screen.getByText("A widget")).toBeInTheDocument();
    expect(screen.getByText("W")).toBeInTheDocument();
  });

  it("calls onnavigate when simple item clicked", async () => {
    const onnavigate = vi.fn();
    render(NavBar, { props: { items, onnavigate } });
    await fireEvent.click(screen.getByText("Home"));
    expect(onnavigate).toHaveBeenCalledWith("/home");
  });

  it("calls onnavigate when dropdown child clicked", async () => {
    const onnavigate = vi.fn();
    render(NavBar, { props: { items, onnavigate } });
    await fireEvent.click(screen.getByText("Products"));
    await fireEvent.click(screen.getByText("Widget"));
    expect(onnavigate).toHaveBeenCalledWith("/products/widget");
  });

  it("opens dropdown on Enter key", async () => {
    render(NavBar, { props: { items } });
    const productsBtn = screen.getByText("Products");
    await fireEvent.keyDown(productsBtn, { key: "Enter" });
    expect(screen.getByText("Widget")).toBeInTheDocument();
  });

  it("opens dropdown on Space key", async () => {
    render(NavBar, { props: { items } });
    const productsBtn = screen.getByText("Products");
    await fireEvent.keyDown(productsBtn, { key: " " });
    expect(screen.getByText("Widget")).toBeInTheDocument();
  });

  it("closes dropdown on Escape key", async () => {
    render(NavBar, { props: { items } });
    const productsBtn = screen.getByText("Products");
    await fireEvent.click(productsBtn);
    await fireEvent.keyDown(productsBtn, { key: "Escape" });
    expect(screen.queryByText("Widget")).not.toBeInTheDocument();
  });

  it("closes dropdown on Escape in dropdown menu", async () => {
    render(NavBar, { props: { items } });
    await fireEvent.click(screen.getByText("Products"));
    const dropdown = screen.getByRole("menu");
    await fireEvent.keyDown(dropdown, { key: "Escape" });
    expect(screen.queryByText("Widget")).not.toBeInTheDocument();
  });

  it("navigates on Enter for simple items", async () => {
    const onnavigate = vi.fn();
    render(NavBar, { props: { items, onnavigate } });
    const homeLink = screen.getByText("Home");
    await fireEvent.keyDown(homeLink, { key: "Enter" });
    expect(onnavigate).toHaveBeenCalledWith("/home");
  });

  it("renders hamburger button", () => {
    render(NavBar, { props: { items } });
    expect(screen.getByLabelText("Toggle menu")).toBeInTheDocument();
  });

  it("toggles mobile menu", async () => {
    const { container } = render(NavBar, { props: { items } });
    const hamburger = screen.getByLabelText("Toggle menu");
    await fireEvent.click(hamburger);
    expect(container.querySelector(".cy-navbar__nav--open")).toBeInTheDocument();
  });

  it("closes mobile menu on navigation", async () => {
    const { container } = render(NavBar, { props: { items } });
    const hamburger = screen.getByLabelText("Toggle menu");
    await fireEvent.click(hamburger);
    await fireEvent.click(screen.getByText("Home"));
    expect(container.querySelector(".cy-navbar__nav--open")).not.toBeInTheDocument();
  });

  it("applies sticky class by default", () => {
    const { container } = render(NavBar, { props: { items } });
    expect(container.querySelector(".cy-navbar--sticky")).toBeInTheDocument();
  });

  it("does not apply sticky class when sticky=false", () => {
    const { container } = render(NavBar, { props: { items, sticky: false } });
    expect(container.querySelector(".cy-navbar--sticky")).not.toBeInTheDocument();
  });

  it("sets aria-expanded on dropdown trigger", async () => {
    render(NavBar, { props: { items } });
    const productsBtn = screen.getByText("Products");
    expect(productsBtn.getAttribute("aria-expanded")).toBe("false");
    await fireEvent.click(productsBtn);
    expect(productsBtn.getAttribute("aria-expanded")).toBe("true");
  });

  it("uses menubar role on item list", () => {
    render(NavBar, { props: { items } });
    expect(screen.getByRole("menubar")).toBeInTheDocument();
  });
});
