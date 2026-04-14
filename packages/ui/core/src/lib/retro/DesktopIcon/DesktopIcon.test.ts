import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import DesktopIcon from "./DesktopIcon.svelte";

describe("DesktopIcon", () => {
  it("renders label", () => {
    render(DesktopIcon, { props: { label: "Terminal" } });
    expect(screen.getByText("Terminal")).toBeInTheDocument();
  });

  it("has accessible name from label", () => {
    render(DesktopIcon, { props: { label: "Investments" } });
    expect(screen.getByRole("button", { name: "Investments" })).toBeInTheDocument();
  });

  it("renders emoji icon", () => {
    render(DesktopIcon, { props: { label: "T", icon: "💻" } });
    expect(screen.getByText("💻")).toBeInTheDocument();
  });

  it("renders iconSrc as img", () => {
    const { container } = render(DesktopIcon, {
      props: { label: "T", iconSrc: "/img.png" },
    });
    const img = container.querySelector("img")!;
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toBe("/img.png");
  });

  it("prefers iconSrc over icon emoji (exclusivity)", () => {
    render(DesktopIcon, { props: { label: "T", iconSrc: "/a.png", icon: "💻" } });
    expect(screen.queryByText("💻")).not.toBeInTheDocument();
  });

  it("fires onActivate on click", async () => {
    const onActivate = vi.fn();
    render(DesktopIcon, { props: { label: "T", onActivate } });
    await fireEvent.click(screen.getByRole("button"));
    expect(onActivate).toHaveBeenCalled();
  });

  it("fires onActivate on double click", async () => {
    const onActivate = vi.fn();
    render(DesktopIcon, { props: { label: "T", onActivate } });
    await fireEvent.dblClick(screen.getByRole("button"));
    expect(onActivate).toHaveBeenCalled();
  });

  it("fires onActivate on Enter key", async () => {
    const onActivate = vi.fn();
    render(DesktopIcon, { props: { label: "T", onActivate } });
    await fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
    expect(onActivate).toHaveBeenCalled();
  });

  it("fires onActivate on Space key", async () => {
    const onActivate = vi.fn();
    render(DesktopIcon, { props: { label: "T", onActivate } });
    await fireEvent.keyDown(screen.getByRole("button"), { key: " " });
    expect(onActivate).toHaveBeenCalled();
  });

  it("does not activate other keys", async () => {
    const onActivate = vi.fn();
    render(DesktopIcon, { props: { label: "T", onActivate } });
    await fireEvent.keyDown(screen.getByRole("button"), { key: "a" });
    expect(onActivate).not.toHaveBeenCalled();
  });

  it("does not activate when disabled", async () => {
    const onActivate = vi.fn();
    render(DesktopIcon, { props: { label: "T", disabled: true, onActivate } });
    await fireEvent.click(screen.getByRole("button"));
    expect(onActivate).not.toHaveBeenCalled();
  });

  it("applies selected modifier", () => {
    const { container } = render(DesktopIcon, { props: { label: "T", selected: true } });
    expect(container.querySelector(".cy-dicon--selected")).toBeInTheDocument();
  });

  it("renders badge when provided", () => {
    render(DesktopIcon, { props: { label: "T", badge: 5 } });
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders string badge", () => {
    render(DesktopIcon, { props: { label: "T", badge: "NEW" } });
    expect(screen.getByText("NEW")).toBeInTheDocument();
  });

  it("does not render badge when undefined", () => {
    const { container } = render(DesktopIcon, { props: { label: "T" } });
    expect(container.querySelector(".cy-dicon__badge")).not.toBeInTheDocument();
  });

  it("renders badge with value 0", () => {
    render(DesktopIcon, { props: { label: "T", badge: 0 } });
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
