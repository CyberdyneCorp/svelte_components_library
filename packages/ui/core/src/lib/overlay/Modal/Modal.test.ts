import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Modal from "./Modal.svelte";

describe("Modal", () => {
  it("does not render when open is false", () => {
    const { container } = render(Modal, { props: { open: false } });
    const overlay = container.querySelector(".cy-modal-overlay");
    expect(overlay).not.toBeInTheDocument();
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

  it("has accessible close button", () => {
    render(Modal, { props: { open: true, title: "Test" } });
    const closeBtn = screen.getByLabelText("Close modal");
    expect(closeBtn).toBeInTheDocument();
  });
});
