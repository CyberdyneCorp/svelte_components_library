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

  it("shows custom button labels", () => {
    render(Dialog, {
      props: { open: true, title: "Test", confirmLabel: "Yes", cancelLabel: "No" },
    });
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("calls onconfirm when confirm button clicked", async () => {
    const onconfirm = vi.fn();
    render(Dialog, { props: { open: true, title: "Test", onconfirm } });
    await fireEvent.click(screen.getByText("Confirm"));
    expect(onconfirm).toHaveBeenCalledOnce();
  });

  it("has aria-modal attribute for accessibility", () => {
    render(Dialog, { props: { open: true, title: "Modal" } });
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });
});
