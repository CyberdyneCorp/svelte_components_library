import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import IconButton from "./IconButton.svelte";

describe("IconButton", () => {
  it("renders with default props", () => {
    render(IconButton, { props: { icon: "check", label: "Confirm" } });
    const btn = screen.getByRole("button");
    expect(btn).toBeInTheDocument();
  });

  it("has correct aria-label", () => {
    render(IconButton, { props: { icon: "x", label: "Close" } });
    const btn = screen.getByRole("button", { name: "Close" });
    expect(btn).toBeInTheDocument();
  });

  it("fires onclick when clicked", async () => {
    const onclick = vi.fn();
    render(IconButton, { props: { icon: "check", label: "Ok", onclick } });
    const btn = screen.getByRole("button");
    await fireEvent.click(btn);
    expect(onclick).toHaveBeenCalledOnce();
  });

  it("is disabled when disabled prop is true", () => {
    render(IconButton, { props: { icon: "x", label: "Close", disabled: true } });
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
  });

  it("applies variant class", () => {
    render(IconButton, { props: { icon: "x", label: "Close", variant: "outline" } });
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("outline");
  });

  describe("count badge", () => {
    it("shows the badge bubble and names the button with label and badgeLabel", () => {
      render(IconButton, {
        props: { icon: "bell", label: "Notificações", badge: 1, badgeLabel: "1 não lida" },
      });
      const bubble = screen.getByText("1");
      expect(bubble).toHaveClass("cy-icon-btn__badge");
      expect(bubble).toHaveAttribute("aria-hidden", "true");
      const btn = screen.getByRole("button");
      expect(btn).toHaveAccessibleName("Notificações 1 não lida");
      expect(bubble.closest("button")).toBe(btn);
    });

    it("accepts a string badge and shows it as-is", () => {
      render(IconButton, { props: { icon: "bell", label: "Alerts", badge: "99+" } });
      expect(screen.getByText("99+")).toHaveClass("cy-icon-btn__badge");
      expect(screen.getByRole("button")).toHaveAccessibleName("Alerts");
    });

    it("renders a zero badge", () => {
      render(IconButton, { props: { icon: "bell", label: "Alerts", badge: 0 } });
      expect(screen.getByText("0")).toHaveClass("cy-icon-btn__badge");
    });

    it("renders no bubble and keeps the plain aria-label without badge", () => {
      const { container } = render(IconButton, { props: { icon: "bell", label: "Notificações" } });
      expect(container.querySelector(".cy-icon-btn__badge")).toBeNull();
      expect(container.querySelector(".cy-icon-btn__sr-only")).toBeNull();
      const btn = screen.getByRole("button", { name: "Notificações" });
      expect(btn).toHaveAttribute("aria-label", "Notificações");
      expect(btn.children).toHaveLength(1);
      expect(btn.firstElementChild?.tagName.toLowerCase()).toBe("svg");
    });

    it("ignores badgeLabel when there is no badge", () => {
      render(IconButton, { props: { icon: "bell", label: "Alerts", badgeLabel: "3 unread" } });
      expect(screen.getByRole("button")).toHaveAccessibleName("Alerts");
    });
  });
});
