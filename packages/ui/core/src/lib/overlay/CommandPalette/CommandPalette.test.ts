import { render, screen } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import CommandPalette from "./CommandPalette.svelte";

describe("CommandPalette", () => {
  const commands = [
    { id: "1", label: "Go to Dashboard", group: "Navigation", onselect: vi.fn() },
    { id: "2", label: "Create New", group: "Actions", shortcut: "Ctrl+N", onselect: vi.fn() },
  ];

  it("does not render when open is false", () => {
    const { container } = render(CommandPalette, { props: { open: false, commands } });
    const overlay = container.querySelector(".cy-cmd-overlay");
    expect(overlay).not.toBeInTheDocument();
  });

  it("renders when open is true", () => {
    render(CommandPalette, { props: { open: true, commands } });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("displays command labels", () => {
    render(CommandPalette, { props: { open: true, commands } });
    expect(screen.getByText("Go to Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Create New")).toBeInTheDocument();
  });

  it("renders search input with placeholder", () => {
    render(CommandPalette, { props: { open: true, commands, placeholder: "Search..." } });
    expect(screen.getByLabelText("Search commands")).toBeInTheDocument();
  });

  it("has accessible dialog label", () => {
    render(CommandPalette, { props: { open: true, commands } });
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-label", "Command palette");
  });
});
