import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import SplitButton from "./SplitButton.svelte";

const items = [
  { label: "Desligar", value: "shutdown", variant: "danger" as const },
  { label: "Iniciar", value: "start" },
];

const base = { label: "Reiniciar", items, menuLabel: "Mais ações" };

function caret() {
  return screen.getByRole("button", { name: "Mais ações" });
}

describe("SplitButton", () => {
  it("clicking the primary action calls onclick once and opens no menu", async () => {
    const onclick = vi.fn();
    render(SplitButton, { props: { ...base, onclick } });
    await fireEvent.click(screen.getByRole("button", { name: "Reiniciar" }));
    expect(onclick).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(caret()).toHaveAttribute("aria-expanded", "false");
  });

  it("renders the caret as a menu button named menuLabel", () => {
    render(SplitButton, { props: base });
    const btn = caret();
    expect(btn.tagName).toBe("BUTTON");
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveAttribute("aria-haspopup", "menu");
    expect(btn).toHaveAttribute("aria-expanded", "false");
    expect(btn).not.toHaveAttribute("aria-controls");
  });

  it("opens the menu from the caret, selects an item and closes again", async () => {
    const onselect = vi.fn();
    render(SplitButton, { props: { ...base, onselect } });
    await fireEvent.click(caret());

    const menu = screen.getByRole("menu", { name: "Mais ações" });
    expect(caret()).toHaveAttribute("aria-expanded", "true");
    expect(caret()).toHaveAttribute("aria-controls", menu.id);
    expect(screen.getAllByRole("menuitem").map((el) => el.textContent?.trim())).toEqual([
      "Desligar",
      "Iniciar",
    ]);

    await fireEvent.click(screen.getByRole("menuitem", { name: "Desligar" }));
    expect(onselect).toHaveBeenCalledExactlyOnceWith("shutdown");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(caret()).toHaveAttribute("aria-expanded", "false");
  });

  it("disables both buttons together when disabled or loading", async () => {
    const disabled = render(SplitButton, { props: { ...base, disabled: true } });
    expect(disabled.getByRole("button", { name: "Reiniciar" })).toBeDisabled();
    expect(disabled.getByRole("button", { name: "Mais ações" })).toBeDisabled();
    disabled.unmount();

    const loading = render(SplitButton, { props: { ...base, loading: true } });
    const primary = loading.getByRole("button", { name: "Reiniciar" });
    expect(primary).toBeDisabled();
    // Button hides its content while loading, so the name must survive as aria-label.
    expect(primary).toHaveAttribute("aria-label", "Reiniciar");
    expect(loading.getByRole("button", { name: "Mais ações" })).toBeDisabled();
  });

  it("toggles the menu closed on a second caret click", async () => {
    render(SplitButton, { props: base });
    await fireEvent.click(caret());
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await fireEvent.click(caret());
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("focuses the first item on open and moves focus with the arrow keys", async () => {
    render(SplitButton, { props: base });
    await fireEvent.click(caret());
    const [first, second] = screen.getAllByRole("menuitem");
    expect(first).toHaveFocus();

    await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
    expect(second).toHaveFocus();
    await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
    expect(first).toHaveFocus();
    await fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowUp" });
    expect(second).toHaveFocus();
    await fireEvent.keyDown(screen.getByRole("menu"), { key: "Home" });
    expect(first).toHaveFocus();
    await fireEvent.keyDown(screen.getByRole("menu"), { key: "End" });
    expect(second).toHaveFocus();
  });

  it("opens the menu with ArrowDown or ArrowUp on the caret and focuses the first item", async () => {
    render(SplitButton, { props: base });
    await fireEvent.keyDown(caret(), { key: "ArrowDown" });
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem")[0]).toHaveFocus();

    await fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    await fireEvent.keyDown(caret(), { key: "ArrowUp" });
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(caret()).toHaveAttribute("aria-expanded", "true");
  });

  it("closes on Escape and returns focus to the caret", async () => {
    render(SplitButton, { props: base });
    await fireEvent.click(caret());
    await fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(caret()).toHaveFocus();
  });

  it("closes when clicking outside", async () => {
    render(SplitButton, { props: base });
    await fireEvent.click(caret());
    await fireEvent.click(document.body);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(caret()).toHaveAttribute("aria-expanded", "false");
  });

  it("defaults menuLabel to 'More actions' and aligns the menu left", async () => {
    const { container } = render(SplitButton, { props: { label: "Restart", items } });
    await fireEvent.click(screen.getByRole("button", { name: "More actions" }));
    expect(container.querySelector(".cy-split-btn__menu--left")).toBeInTheDocument();
  });

  it("aligns the menu to the right when asked", async () => {
    const { container } = render(SplitButton, { props: { ...base, align: "right" } });
    await fireEvent.click(caret());
    expect(container.querySelector(".cy-split-btn__menu--right")).toBeInTheDocument();
  });

  it("applies the same variant and size to both buttons and marks danger items", async () => {
    render(SplitButton, { props: { ...base, variant: "secondary", size: "sm" } });
    for (const btn of screen.getAllByRole("button")) {
      expect(btn.className).toContain("cy-btn--secondary");
      expect(btn.className).toContain("cy-btn--sm");
    }
    await fireEvent.click(caret());
    expect(screen.getByRole("menuitem", { name: "Desligar" }).className).toContain(
      "cy-split-btn__item--danger",
    );
    expect(screen.getByRole("menuitem", { name: "Iniciar" }).className).not.toContain(
      "cy-split-btn__item--danger",
    );
  });
});
