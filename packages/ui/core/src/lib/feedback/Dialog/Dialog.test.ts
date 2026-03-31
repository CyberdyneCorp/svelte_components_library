import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import Dialog from "./Dialog.svelte";

describe("Dialog", () => {
  it("does not render when open is false", () => {
    render(Dialog, { props: { open: false, title: "Test" } });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders with title when open", () => {
    render(Dialog, { props: { open: true, title: "Confirm action" } });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Confirm action")).toBeInTheDocument();
  });

  it("has aria-modal attribute", () => {
    render(Dialog, { props: { open: true, title: "Modal" } });
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("has aria-labelledby pointing to title", () => {
    render(Dialog, { props: { open: true, title: "Test" } });
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby", "dialog-title");
  });

  // Button labels
  it("shows default button labels", () => {
    render(Dialog, { props: { open: true, title: "Test" } });
    expect(screen.getByText("Confirm")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("shows custom button labels", () => {
    render(Dialog, {
      props: { open: true, title: "Test", confirmLabel: "Yes", cancelLabel: "No" },
    });
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  // Confirm callback
  it("calls onconfirm when confirm button clicked", async () => {
    const onconfirm = vi.fn();
    render(Dialog, { props: { open: true, title: "Test", onconfirm } });
    await fireEvent.click(screen.getByText("Confirm"));
    expect(onconfirm).toHaveBeenCalledOnce();
  });

  it("closes on confirm", async () => {
    const { container } = render(Dialog, { props: { open: true, title: "Test" } });
    await fireEvent.click(screen.getByText("Confirm"));
    expect(container.querySelector(".cy-dialog-overlay")).not.toBeInTheDocument();
  });

  // Cancel callback
  it("calls oncancel when cancel button clicked", async () => {
    const oncancel = vi.fn();
    render(Dialog, { props: { open: true, title: "Test", oncancel } });
    await fireEvent.click(screen.getByText("Cancel"));
    expect(oncancel).toHaveBeenCalledOnce();
  });

  it("closes on cancel", async () => {
    const { container } = render(Dialog, { props: { open: true, title: "Test" } });
    await fireEvent.click(screen.getByText("Cancel"));
    expect(container.querySelector(".cy-dialog-overlay")).not.toBeInTheDocument();
  });

  // Escape key
  it("closes on Escape key", async () => {
    const oncancel = vi.fn();
    const { container } = render(Dialog, { props: { open: true, title: "Test", oncancel } });
    const overlay = screen.getByRole("dialog");
    await fireEvent.keyDown(overlay, { key: "Escape" });
    expect(container.querySelector(".cy-dialog-overlay")).not.toBeInTheDocument();
    expect(oncancel).toHaveBeenCalledOnce();
  });

  // Backdrop click
  it("closes on backdrop click", async () => {
    const oncancel = vi.fn();
    const { container } = render(Dialog, { props: { open: true, title: "Test", oncancel } });
    const overlay = screen.getByRole("dialog");
    await fireEvent.click(overlay);
    expect(container.querySelector(".cy-dialog-overlay")).not.toBeInTheDocument();
    expect(oncancel).toHaveBeenCalledOnce();
  });

  it("does not close on content click", async () => {
    render(Dialog, { props: { open: true, title: "Test" } });
    await fireEvent.click(screen.getByText("Test"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  // Variant
  it("applies default variant class", () => {
    const { container } = render(Dialog, { props: { open: true, title: "Test" } });
    expect(container.querySelector(".cy-dialog__btn--default")).toBeInTheDocument();
  });

  it("applies danger variant class", () => {
    const { container } = render(Dialog, { props: { open: true, title: "Test", variant: "danger" } });
    expect(container.querySelector(".cy-dialog__btn--danger")).toBeInTheDocument();
  });

  // Focus trap - Tab key
  it("handles Tab key without crashing", async () => {
    render(Dialog, { props: { open: true, title: "Test" } });
    const overlay = screen.getByRole("dialog");
    await fireEvent.keyDown(overlay, { key: "Tab" });
    expect(overlay).toBeInTheDocument();
  });

  it("handles Shift+Tab key without crashing", async () => {
    render(Dialog, { props: { open: true, title: "Test" } });
    const overlay = screen.getByRole("dialog");
    await fireEvent.keyDown(overlay, { key: "Tab", shiftKey: true });
    expect(overlay).toBeInTheDocument();
  });

  // Title ID
  it("title has correct id", () => {
    render(Dialog, { props: { open: true, title: "My Dialog" } });
    const title = screen.getByText("My Dialog");
    expect(title.id).toBe("dialog-title");
  });
});
