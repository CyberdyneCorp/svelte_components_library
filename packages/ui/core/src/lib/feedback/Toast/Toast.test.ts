import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Toast from "./Toast.svelte";

describe("Toast", () => {
  it("renders with aria-live polite region", () => {
    const { container } = render(Toast);
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });

  it("starts with no toast items", () => {
    const { container } = render(Toast);
    const toasts = container.querySelectorAll('[role="alert"]');
    expect(toasts.length).toBe(0);
  });

  it("renders the container element", () => {
    const { container } = render(Toast);
    const toastContainer = container.querySelector(".cy-toast-container");
    expect(toastContainer).toBeInTheDocument();
  });

  it("container has correct class", () => {
    const { container } = render(Toast);
    expect(container.querySelector(".cy-toast-container")).toBeTruthy();
  });
});
