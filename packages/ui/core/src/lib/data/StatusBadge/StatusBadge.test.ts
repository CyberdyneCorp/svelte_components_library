import { render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, it, expect } from "vitest";
import StatusBadge from "./StatusBadge.svelte";
import { STATUS_BADGE_DEFAULTS, type StatusBadgeStatus } from "./statusBadge.js";

const STATUSES = Object.keys(STATUS_BADGE_DEFAULTS) as StatusBadgeStatus[];

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

  describe("defaults (unchanged output)", () => {
    it("renders a dot and no icon without indicator", () => {
      const { container } = render(StatusBadge, { props: { status: "error", label: "Down" } });
      expect(container.querySelector(".cy-status-badge__dot")).toBeInTheDocument();
      expect(container.querySelector(".cy-status-badge__icon")).toBeNull();
      expect(container.querySelector("svg")).toBeNull();
    });

    it("keeps an empty label empty in dot mode", () => {
      const { container } = render(StatusBadge, { props: { status: "pending" } });
      expect(container.querySelector(".cy-status-badge__label")?.textContent).toBe("");
    });

    it.each([
      ["active", "success"],
      ["inactive", "neutral"],
      ["pending", "warning"],
      ["error", "error"],
    ] as const)("maps legacy status %s to tone %s", (status, tone) => {
      const { container } = render(StatusBadge, { props: { status, label: "x" } });
      const badge = container.querySelector(".cy-status-badge")!;
      expect(badge).toHaveClass(`cy-status-badge--${status}`, `cy-status-badge--tone-${tone}`);
    });
  });

  describe("six kinds", () => {
    it("supports warning and info", () => {
      const { container } = render(StatusBadge, { props: { status: "warning", label: "Low balance" } });
      expect(container.querySelector(".cy-status-badge--warning")).toHaveClass("cy-status-badge--tone-warning");
      render(StatusBadge, { props: { status: "info", label: "Syncing" } });
      expect(screen.getByText("Syncing").closest(".cy-status-badge")).toHaveClass("cy-status-badge--tone-info");
    });

    it("gives every status a distinct icon and label", () => {
      const icons = new Set(STATUSES.map((s) => STATUS_BADGE_DEFAULTS[s].icon));
      const labels = new Set(STATUSES.map((s) => STATUS_BADGE_DEFAULTS[s].label));
      expect(STATUSES).toHaveLength(6);
      expect(icons.size).toBe(6);
      expect(labels.size).toBe(6);
    });

    it.each(STATUSES)("renders a distinct icon and default label for %s in icon mode", (status) => {
      const { container } = render(StatusBadge, { props: { status, indicator: "icon" } });
      const svgPath = container.querySelector(".cy-status-badge__icon svg path")?.getAttribute("d");
      expect(svgPath).toBeTruthy();
      expect(container.querySelector(".cy-status-badge__icon")).toHaveAttribute("aria-hidden", "true");
      expect(container.querySelector(".cy-status-badge__dot")).toBeNull();
      expect(screen.getByText(STATUS_BADGE_DEFAULTS[status].label)).toBeInTheDocument();
    });

    it("uses different icon shapes across statuses", () => {
      const paths = STATUSES.map((status) => {
        const { container, unmount } = render(StatusBadge, { props: { status, indicator: "icon" } });
        const d = container.querySelector(".cy-status-badge__icon svg path")?.getAttribute("d");
        unmount();
        return d;
      });
      expect(new Set(paths).size).toBe(STATUSES.length);
    });

    it("prefers an explicit label over the default in icon mode", () => {
      render(StatusBadge, { props: { status: "error", indicator: "icon", label: "Falhou" } });
      expect(screen.getByText("Falhou")).toBeInTheDocument();
      expect(screen.queryByText("Error")).toBeNull();
    });
  });

  describe("tone and icon overrides", () => {
    it("tone overrides the status colour but keeps the status class", () => {
      const { container } = render(StatusBadge, { props: { status: "pending", tone: "info", label: "Queued" } });
      const badge = container.querySelector(".cy-status-badge")!;
      expect(badge).toHaveClass("cy-status-badge--pending", "cy-status-badge--tone-info");
      expect(badge).not.toHaveClass("cy-status-badge--tone-warning");
    });

    it("renders a custom icon snippet in place of the dot", () => {
      const icon = createRawSnippet(() => ({ render: () => `<svg data-testid="custom"></svg>` }));
      const { container } = render(StatusBadge, { props: { status: "active", icon } });
      expect(screen.getByTestId("custom").closest(".cy-status-badge__icon")).toHaveAttribute("aria-hidden", "true");
      expect(container.querySelector(".cy-status-badge__dot")).toBeNull();
      expect(screen.getByText("Active")).toBeInTheDocument();
    });
  });
});
