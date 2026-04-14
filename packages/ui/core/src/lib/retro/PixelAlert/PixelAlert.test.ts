import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import PixelAlert from "./PixelAlert.svelte";

describe("PixelAlert", () => {
  it("does not render when closed", () => {
    const { container } = render(PixelAlert, { props: { open: false } });
    expect(container.querySelector(".cy-palert")).not.toBeInTheDocument();
  });
  it("renders alertdialog when open", () => {
    render(PixelAlert, { props: { open: true, title: "T", message: "M" } });
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });
  it("shows title and message", () => {
    render(PixelAlert, { props: { open: true, title: "Hi", message: "Body" } });
    expect(screen.getByText("Hi")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });
  it("aria-modal and aria-labelledby", () => {
    render(PixelAlert, { props: { open: true, title: "T" } });
    const d = screen.getByRole("alertdialog");
    expect(d).toHaveAttribute("aria-modal", "true");
    expect(d).toHaveAttribute("aria-labelledby", "cy-palert-title");
  });
  it.each(["info", "success", "warning", "error"] as const)("applies %s variant", (variant) => {
    const { container } = render(PixelAlert, { props: { open: true, variant } });
    expect(container.querySelector(`.cy-palert--${variant}`)).toBeInTheDocument();
  });
  it("confirm button fires onConfirm and closes", async () => {
    const onConfirm = vi.fn();
    const { container } = render(PixelAlert, { props: { open: true, confirmLabel: "OK", onConfirm } });
    await fireEvent.click(screen.getByText("OK"));
    expect(onConfirm).toHaveBeenCalled();
    expect(container.querySelector(".cy-palert")).not.toBeInTheDocument();
  });
  it("cancel button fires onCancel and closes", async () => {
    const onCancel = vi.fn();
    const { container } = render(PixelAlert, { props: { open: true, cancelLabel: "Cancel", onCancel } });
    await fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
    expect(container.querySelector(".cy-palert")).not.toBeInTheDocument();
  });
  it("omits cancel button when no cancelLabel", () => {
    render(PixelAlert, { props: { open: true } });
    expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
  });
  it("Enter triggers confirm", async () => {
    const onConfirm = vi.fn();
    render(PixelAlert, { props: { open: true, onConfirm } });
    await fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Enter" });
    expect(onConfirm).toHaveBeenCalled();
  });
  it("Escape triggers cancel", async () => {
    const onCancel = vi.fn();
    const { container } = render(PixelAlert, { props: { open: true, onCancel } });
    await fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });
    expect(onCancel).toHaveBeenCalled();
    expect(container.querySelector(".cy-palert")).not.toBeInTheDocument();
  });
  it("uses info icon by default", () => {
    render(PixelAlert, { props: { open: true } });
    expect(screen.getByText("ℹ")).toBeInTheDocument();
  });
});
