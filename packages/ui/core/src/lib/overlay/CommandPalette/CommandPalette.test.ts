import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import CommandPalette from "./CommandPalette.svelte";

const commands = [
  { id: "1", label: "New File", group: "File", icon: "+", shortcut: "Ctrl+N", onselect: vi.fn() },
  { id: "2", label: "Open File", group: "File", onselect: vi.fn() },
  { id: "3", label: "Search", group: "Edit", shortcut: "Ctrl+F", onselect: vi.fn() },
  { id: "4", label: "Settings", onselect: vi.fn() },
];

describe("CommandPalette", () => {
  it("does not render when closed", () => {
    render(CommandPalette, { props: { open: false, commands } });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders when open", () => {
    render(CommandPalette, { props: { open: true, commands } });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders search input", () => {
    render(CommandPalette, { props: { open: true, commands } });
    expect(screen.getByLabelText("Search commands")).toBeInTheDocument();
  });

  it("renders custom placeholder", () => {
    render(CommandPalette, { props: { open: true, commands, placeholder: "Find..." } });
    expect(screen.getByPlaceholderText("Find...")).toBeInTheDocument();
  });

  it("renders all commands initially", () => {
    render(CommandPalette, { props: { open: true, commands } });
    expect(screen.getByText("New File")).toBeInTheDocument();
    expect(screen.getByText("Open File")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders group headers", () => {
    render(CommandPalette, { props: { open: true, commands } });
    expect(screen.getByText("File")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("renders shortcuts", () => {
    render(CommandPalette, { props: { open: true, commands } });
    expect(screen.getByText("Ctrl+N")).toBeInTheDocument();
    expect(screen.getByText("Ctrl+F")).toBeInTheDocument();
  });

  it("renders icons", () => {
    render(CommandPalette, { props: { open: true, commands } });
    expect(screen.getByText("+")).toBeInTheDocument();
  });

  it("filters commands by search query", async () => {
    render(CommandPalette, { props: { open: true, commands } });
    const input = screen.getByLabelText("Search commands");
    await fireEvent.input(input, { target: { value: "new" } });
    expect(screen.getByText("New File")).toBeInTheDocument();
    expect(screen.queryByText("Open File")).not.toBeInTheDocument();
    expect(screen.queryByText("Search")).not.toBeInTheDocument();
  });

  it("shows no results message", async () => {
    render(CommandPalette, { props: { open: true, commands } });
    const input = screen.getByLabelText("Search commands");
    await fireEvent.input(input, { target: { value: "zzzzz" } });
    expect(screen.getByText("No commands found.")).toBeInTheDocument();
  });

  it("is case insensitive", async () => {
    render(CommandPalette, { props: { open: true, commands } });
    const input = screen.getByLabelText("Search commands");
    await fireEvent.input(input, { target: { value: "SEARCH" } });
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  it("calls onselect when command clicked", async () => {
    const cmds = commands.map((c) => ({ ...c, onselect: vi.fn() }));
    render(CommandPalette, { props: { open: true, commands: cmds } });
    await fireEvent.click(screen.getByText("New File"));
    expect(cmds[0].onselect).toHaveBeenCalled();
  });

  it("closes after selection", async () => {
    const cmds = commands.map((c) => ({ ...c, onselect: vi.fn() }));
    const { container } = render(CommandPalette, { props: { open: true, commands: cmds } });
    await fireEvent.click(screen.getByText("New File"));
    expect(container.querySelector(".cy-cmd-overlay")).not.toBeInTheDocument();
  });

  it("navigates down with ArrowDown", async () => {
    render(CommandPalette, { props: { open: true, commands } });
    const overlay = screen.getByRole("dialog");
    await fireEvent.keyDown(overlay, { key: "ArrowDown" });
    const items = screen.getAllByRole("option");
    expect(items[1]).toHaveAttribute("aria-selected", "true");
  });

  it("navigates up with ArrowUp", async () => {
    render(CommandPalette, { props: { open: true, commands } });
    const overlay = screen.getByRole("dialog");
    await fireEvent.keyDown(overlay, { key: "ArrowDown" });
    await fireEvent.keyDown(overlay, { key: "ArrowUp" });
    const items = screen.getAllByRole("option");
    expect(items[0]).toHaveAttribute("aria-selected", "true");
  });

  it("wraps around at bottom", async () => {
    render(CommandPalette, { props: { open: true, commands } });
    const overlay = screen.getByRole("dialog");
    for (let i = 0; i < 4; i++) {
      await fireEvent.keyDown(overlay, { key: "ArrowDown" });
    }
    const items = screen.getAllByRole("option");
    expect(items[0]).toHaveAttribute("aria-selected", "true");
  });

  it("selects with Enter key", async () => {
    const cmds = commands.map((c) => ({ ...c, onselect: vi.fn() }));
    render(CommandPalette, { props: { open: true, commands: cmds } });
    const overlay = screen.getByRole("dialog");
    await fireEvent.keyDown(overlay, { key: "Enter" });
    expect(cmds[0].onselect).toHaveBeenCalled();
  });

  it("closes on Escape key", async () => {
    const { container } = render(CommandPalette, { props: { open: true, commands } });
    const overlay = screen.getByRole("dialog");
    await fireEvent.keyDown(overlay, { key: "Escape" });
    expect(container.querySelector(".cy-cmd-overlay")).not.toBeInTheDocument();
  });

  it("closes on backdrop click", async () => {
    const { container } = render(CommandPalette, { props: { open: true, commands } });
    const overlay = screen.getByRole("dialog");
    await fireEvent.click(overlay);
    expect(container.querySelector(".cy-cmd-overlay")).not.toBeInTheDocument();
  });

  it("does not close on content click", async () => {
    render(CommandPalette, { props: { open: true, commands } });
    const input = screen.getByLabelText("Search commands");
    await fireEvent.click(input);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("updates focus on mouse enter", async () => {
    render(CommandPalette, { props: { open: true, commands } });
    const items = screen.getAllByRole("option");
    await fireEvent.mouseEnter(items[2]);
    expect(items[2]).toHaveAttribute("aria-selected", "true");
  });

  it("toggles open on Ctrl+K", async () => {
    const { container } = render(CommandPalette, { props: { open: false, commands } });
    await fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(container.querySelector(".cy-cmd-overlay")).toBeInTheDocument();
  });

  it("shows ESC key hint", () => {
    render(CommandPalette, { props: { open: true, commands } });
    expect(screen.getByText("ESC")).toBeInTheDocument();
  });

  it("shows navigation hints in footer", () => {
    render(CommandPalette, { props: { open: true, commands } });
    const hint = screen.getByText(/navigate/);
    expect(hint).toBeInTheDocument();
    expect(hint.textContent).toContain("select");
    expect(hint.textContent).toContain("close");
  });

  it("has accessible dialog label", () => {
    render(CommandPalette, { props: { open: true, commands } });
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-label", "Command palette");
  });
});
