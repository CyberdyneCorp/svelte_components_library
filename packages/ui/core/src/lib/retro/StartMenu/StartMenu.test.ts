import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import StartMenu from "./StartMenu.svelte";

const items = [
  { id: "team", label: "Our Team", icon: "👥" },
  { id: "terminal", label: "Terminal", icon: "💻" },
  { id: "close", label: "Close All Windows", icon: "❌", disabled: true },
];

describe("StartMenu", () => {
  it("renders the trigger button with label", () => {
    render(StartMenu, { props: { items, label: "Start" } });
    expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
  });

  it("menu is closed by default", () => {
    render(StartMenu, { props: { items } });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens menu on button click", async () => {
    render(StartMenu, { props: { items } });
    await fireEvent.click(screen.getByRole("button", { name: /start/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("aria-expanded reflects state", async () => {
    render(StartMenu, { props: { items } });
    const btn = screen.getByRole("button", { name: /start/i });
    expect(btn).toHaveAttribute("aria-expanded", "false");
    await fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "true");
  });

  it("renders header when open", async () => {
    render(StartMenu, { props: { items, header: "Menu" } });
    await fireEvent.click(screen.getByRole("button", { name: /start/i }));
    expect(screen.getByText("Menu")).toBeInTheDocument();
  });

  it("renders all items", async () => {
    render(StartMenu, { props: { items } });
    await fireEvent.click(screen.getByRole("button", { name: /start/i }));
    expect(screen.getByText("Our Team")).toBeInTheDocument();
    expect(screen.getByText("Terminal")).toBeInTheDocument();
  });

  it("fires onSelect and onItemSelect on click", async () => {
    const onSelect = vi.fn();
    const onItemSelect = vi.fn();
    render(StartMenu, {
      props: {
        items: [{ id: "team", label: "Our Team", onSelect }],
        onItemSelect,
      },
    });
    await fireEvent.click(screen.getByRole("button", { name: /start/i }));
    await fireEvent.click(screen.getByText("Our Team"));
    expect(onSelect).toHaveBeenCalled();
    expect(onItemSelect).toHaveBeenCalledWith("team");
  });

  it("closes after selection", async () => {
    render(StartMenu, { props: { items } });
    await fireEvent.click(screen.getByRole("button", { name: /start/i }));
    await fireEvent.click(screen.getByText("Our Team"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("does not fire onSelect for disabled items", async () => {
    const onSelect = vi.fn();
    render(StartMenu, {
      props: {
        items: [{ id: "x", label: "X", disabled: true, onSelect }],
      },
    });
    await fireEvent.click(screen.getByRole("button", { name: /start/i }));
    await fireEvent.click(screen.getByText("X"));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("closes on Escape", async () => {
    render(StartMenu, { props: { items } });
    await fireEvent.click(screen.getByRole("button", { name: /start/i }));
    await fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes when clicking outside", async () => {
    render(StartMenu, { props: { items } });
    await fireEvent.click(screen.getByRole("button", { name: /start/i }));
    await fireEvent.click(document.body);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("renders icons when provided", async () => {
    render(StartMenu, { props: { items } });
    await fireEvent.click(screen.getByRole("button", { name: /start/i }));
    expect(screen.getByText("👥")).toBeInTheDocument();
  });

  it("disabled item is disabled attribute", async () => {
    render(StartMenu, { props: { items } });
    await fireEvent.click(screen.getByRole("button", { name: /start/i }));
    const disabled = screen.getByText("Close All Windows").closest("button")!;
    expect(disabled).toBeDisabled();
  });

  it("toggles menu closed on second button click", async () => {
    render(StartMenu, { props: { items } });
    const btn = screen.getByRole("button", { name: /start/i });
    await fireEvent.click(btn);
    await fireEvent.click(btn);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
