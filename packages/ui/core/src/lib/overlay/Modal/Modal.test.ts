import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import Modal from "./Modal.svelte";

describe("Modal", () => {
  it("does not render when open is false", () => {
    const { container } = render(Modal, { props: { open: false } });
    expect(container.querySelector(".cy-modal-overlay")).not.toBeInTheDocument();
  });

  it("renders when open is true", () => {
    render(Modal, { props: { open: true, title: "Confirm" } });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("displays the title", () => {
    render(Modal, { props: { open: true, title: "Delete Item" } });
    expect(screen.getByText("Delete Item")).toBeInTheDocument();
  });

  it("has aria-modal attribute", () => {
    render(Modal, { props: { open: true, title: "Test" } });
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("has aria-labelledby pointing to title", () => {
    render(Modal, { props: { open: true, title: "Test" } });
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby", "modal-title");
  });

  it("has accessible close button", () => {
    render(Modal, { props: { open: true, title: "Test" } });
    const closeBtn = screen.getByLabelText("Close modal");
    expect(closeBtn).toBeInTheDocument();
  });

  // Close button
  it("closes on close button click", async () => {
    const { container } = render(Modal, { props: { open: true, title: "Test" } });
    const closeBtn = screen.getByLabelText("Close modal");
    await fireEvent.click(closeBtn);
    expect(container.querySelector(".cy-modal-overlay")).not.toBeInTheDocument();
  });

  // Escape key
  it("closes on Escape key", async () => {
    const { container } = render(Modal, { props: { open: true, title: "Test" } });
    const overlay = screen.getByRole("dialog");
    await fireEvent.keyDown(overlay, { key: "Escape" });
    expect(container.querySelector(".cy-modal-overlay")).not.toBeInTheDocument();
  });

  // Backdrop click
  it("closes on backdrop click", async () => {
    const { container } = render(Modal, { props: { open: true, title: "Test" } });
    const overlay = screen.getByRole("dialog");
    await fireEvent.click(overlay);
    expect(container.querySelector(".cy-modal-overlay")).not.toBeInTheDocument();
  });

  it("does not close when clicking inside modal content", async () => {
    render(Modal, { props: { open: true, title: "Test" } });
    const title = screen.getByText("Test");
    await fireEvent.click(title);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  // Sizes
  it("applies sm size class", () => {
    const { container } = render(Modal, { props: { open: true, title: "T", size: "sm" } });
    expect(container.querySelector(".cy-modal--sm")).toBeInTheDocument();
  });

  it("applies md size class by default", () => {
    const { container } = render(Modal, { props: { open: true, title: "T" } });
    expect(container.querySelector(".cy-modal--md")).toBeInTheDocument();
  });

  it("applies lg size class", () => {
    const { container } = render(Modal, { props: { open: true, title: "T", size: "lg" } });
    expect(container.querySelector(".cy-modal--lg")).toBeInTheDocument();
  });

  // Focus trap - Tab key handling
  it("handles Tab key without crashing", async () => {
    render(Modal, { props: { open: true, title: "Test" } });
    const overlay = screen.getByRole("dialog");
    await fireEvent.keyDown(overlay, { key: "Tab" });
    expect(overlay).toBeInTheDocument();
  });

  it("handles Shift+Tab key without crashing", async () => {
    render(Modal, { props: { open: true, title: "Test" } });
    const overlay = screen.getByRole("dialog");
    await fireEvent.keyDown(overlay, { key: "Tab", shiftKey: true });
    expect(overlay).toBeInTheDocument();
  });

  // Title ID
  it("title has correct id for aria-labelledby", () => {
    render(Modal, { props: { open: true, title: "My Title" } });
    const title = screen.getByText("My Title");
    expect(title.id).toBe("modal-title");
  });
});
