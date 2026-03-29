import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import MenuItem from "./MenuItem.svelte";

describe("MenuItem", () => {
  it("renders as a link when href is provided", () => {
    render(MenuItem, { props: { label: "Home", href: "/home" } });
    const link = screen.getByText("Home").closest("a");
    expect(link).toHaveAttribute("href", "/home");
  });

  it("renders as a button when no href", () => {
    render(MenuItem, { props: { label: "Action" } });
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("displays the label", () => {
    render(MenuItem, { props: { label: "Dashboard" } });
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("applies active class", () => {
    const { container } = render(MenuItem, { props: { label: "Home", active: true } });
    expect(container.querySelector(".cy-menu-item--active")).toBeInTheDocument();
  });

  it("fires onclick when clicked", async () => {
    const onclick = vi.fn();
    render(MenuItem, { props: { label: "Click me", onclick } });
    await fireEvent.click(screen.getByRole("button"));
    expect(onclick).toHaveBeenCalledOnce();
  });
});
