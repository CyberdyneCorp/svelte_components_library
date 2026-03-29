import { render, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import ModalBackdrop from "./ModalBackdrop.svelte";

describe("ModalBackdrop", () => {
  it("does not render when open is false", () => {
    const { container } = render(ModalBackdrop, { props: { open: false } });
    const backdrop = container.querySelector(".cy-modal-backdrop");
    expect(backdrop).not.toBeInTheDocument();
  });

  it("renders when open is true", () => {
    const { container } = render(ModalBackdrop, { props: { open: true } });
    const backdrop = container.querySelector(".cy-modal-backdrop");
    expect(backdrop).toBeInTheDocument();
  });

  it("applies blur class when blur is true", () => {
    const { container } = render(ModalBackdrop, { props: { open: true, blur: true } });
    const backdrop = container.querySelector(".cy-modal-backdrop--blur");
    expect(backdrop).toBeInTheDocument();
  });

  it("calls onclick when clicked", async () => {
    const onclick = vi.fn();
    const { container } = render(ModalBackdrop, { props: { open: true, onclick } });
    const backdrop = container.querySelector(".cy-modal-backdrop")!;
    await fireEvent.click(backdrop);
    expect(onclick).toHaveBeenCalledOnce();
  });

  it("has presentation role", () => {
    const { container } = render(ModalBackdrop, { props: { open: true } });
    const backdrop = container.querySelector("[role='presentation']");
    expect(backdrop).toBeInTheDocument();
  });
});
