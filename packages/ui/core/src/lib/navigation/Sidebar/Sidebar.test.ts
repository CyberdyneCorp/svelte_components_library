import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Sidebar from "./Sidebar.svelte";

const items = [
  { id: "home", label: "Home", href: "/" },
  { id: "settings", label: "Settings", children: [
    { id: "general", label: "General", href: "/settings/general" },
  ]},
];

describe("Sidebar", () => {
  it("renders a nav element", () => {
    render(Sidebar, { props: { items } });
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("renders top-level items", () => {
    render(Sidebar, { props: { items } });
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("hides children by default", () => {
    render(Sidebar, { props: { items } });
    expect(screen.queryByText("General")).not.toBeInTheDocument();
  });

  it("expands children on click", async () => {
    render(Sidebar, { props: { items } });
    await fireEvent.click(screen.getByText("Settings"));
    expect(screen.getByText("General")).toBeInTheDocument();
  });

  it("applies collapsed class", () => {
    const { container } = render(Sidebar, { props: { items, collapsed: true } });
    expect(container.querySelector(".cy-sidebar--collapsed")).toBeInTheDocument();
  });
});
