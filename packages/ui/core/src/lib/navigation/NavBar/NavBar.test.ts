import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import NavBar from "./NavBar.svelte";

const items = [
  { label: "Dashboard", href: "/dashboard", active: true },
  {
    label: "Products",
    children: [
      { label: "CyberdyneDAO", href: "/products/dao", description: "Governance" },
      { label: "YieldPath", href: "/products/yield" },
    ],
  },
  { label: "Community", href: "/community" },
];

describe("NavBar", () => {
  it("renders the navbar", () => {
    render(NavBar, { props: { items } });
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("displays the brand label", () => {
    render(NavBar, { props: { brand: { label: "Cyberdyne" }, items } });
    expect(screen.getByText("Cyberdyne")).toBeInTheDocument();
  });

  it("renders nav items", () => {
    render(NavBar, { props: { items } });
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Community")).toBeInTheDocument();
  });

  it("toggles dropdown on click", async () => {
    render(NavBar, { props: { items } });
    const productsBtn = screen.getByText("Products");
    expect(screen.queryByText("CyberdyneDAO")).not.toBeInTheDocument();
    await fireEvent.click(productsBtn);
    expect(screen.getByText("CyberdyneDAO")).toBeInTheDocument();
  });

  it("marks active item", () => {
    render(NavBar, { props: { items } });
    const dashboard = screen.getByText("Dashboard");
    expect(dashboard.className).toContain("active");
  });
});
