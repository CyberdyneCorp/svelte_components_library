import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import StatusBadge from "./StatusBadge.svelte";

describe("StatusBadge", () => {
  it("renders the label", () => {
    render(StatusBadge, { props: { label: "Online" } });
    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  it("applies active status class by default", () => {
    const { container } = render(StatusBadge, { props: { label: "Active" } });
    expect(container.querySelector(".cy-status-badge--active")).toBeInTheDocument();
  });

  it("applies error status class", () => {
    const { container } = render(StatusBadge, { props: { status: "error", label: "Error" } });
    expect(container.querySelector(".cy-status-badge--error")).toBeInTheDocument();
  });

  it("renders the status dot", () => {
    const { container } = render(StatusBadge, { props: { label: "Test" } });
    expect(container.querySelector(".cy-status-badge__dot")).toBeInTheDocument();
  });

  it("applies pending status class", () => {
    const { container } = render(StatusBadge, { props: { status: "pending", label: "Pending" } });
    expect(container.querySelector(".cy-status-badge--pending")).toBeInTheDocument();
  });
});
