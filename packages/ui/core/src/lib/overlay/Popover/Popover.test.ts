import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import Popover from "./Popover.svelte";

describe("Popover", () => {
  it("renders trigger area", () => {
    const { container } = render(Popover, { props: { open: false } });
    expect(container.querySelector(".cy-popover__trigger")).toBeInTheDocument();
  });

  it("does not show content when closed", () => {
    const { container } = render(Popover, { props: { open: false } });
    expect(container.querySelector(".cy-popover__content")).not.toBeInTheDocument();
  });

  it("shows content when open", () => {
    const { container } = render(Popover, { props: { open: true } });
    expect(container.querySelector(".cy-popover__content")).toBeInTheDocument();
  });

  it("toggles open on trigger click", async () => {
    const { container } = render(Popover, { props: { open: false } });
    const trigger = container.querySelector(".cy-popover__trigger")!;
    await fireEvent.click(trigger);
    expect(container.querySelector(".cy-popover__content")).toBeInTheDocument();
  });

  it("toggles closed on trigger click when open", async () => {
    const { container } = render(Popover, { props: { open: true } });
    const trigger = container.querySelector(".cy-popover__trigger")!;
    await fireEvent.click(trigger);
    expect(container.querySelector(".cy-popover__content")).not.toBeInTheDocument();
  });

  it("closes on Escape key", async () => {
    const { container } = render(Popover, { props: { open: true } });
    await fireEvent.keyDown(document, { key: "Escape" });
    expect(container.querySelector(".cy-popover__content")).not.toBeInTheDocument();
  });

  it("closes on outside click", async () => {
    const { container } = render(Popover, { props: { open: true } });
    await fireEvent.click(document.body);
    expect(container.querySelector(".cy-popover__content")).not.toBeInTheDocument();
  });

  it("does not close on inside click", async () => {
    const { container } = render(Popover, { props: { open: true } });
    const content = container.querySelector(".cy-popover__body")!;
    await fireEvent.click(content);
    expect(container.querySelector(".cy-popover__content")).toBeInTheDocument();
  });

  it("does not close on outside click when closeOnClickOutside is false", async () => {
    const { container } = render(Popover, { props: { open: true, closeOnClickOutside: false } });
    await fireEvent.click(document.body);
    expect(container.querySelector(".cy-popover__content")).toBeInTheDocument();
  });

  it("applies bottom position class by default", () => {
    const { container } = render(Popover, { props: { open: true } });
    expect(container.querySelector(".cy-popover__content--bottom")).toBeInTheDocument();
  });

  it("applies top position class", () => {
    const { container } = render(Popover, { props: { open: true, position: "top" } });
    expect(container.querySelector(".cy-popover__content--top")).toBeInTheDocument();
  });

  it("applies left position class", () => {
    const { container } = render(Popover, { props: { open: true, position: "left" } });
    expect(container.querySelector(".cy-popover__content--left")).toBeInTheDocument();
  });

  it("applies right position class", () => {
    const { container } = render(Popover, { props: { open: true, position: "right" } });
    expect(container.querySelector(".cy-popover__content--right")).toBeInTheDocument();
  });

  it("renders arrow element", () => {
    const { container } = render(Popover, { props: { open: true } });
    expect(container.querySelector(".cy-popover__arrow")).toBeInTheDocument();
  });

  it("applies correct arrow position class", () => {
    const { container } = render(Popover, { props: { open: true, position: "top" } });
    expect(container.querySelector(".cy-popover__arrow--top")).toBeInTheDocument();
  });

  it("sets aria-expanded on trigger", () => {
    const { container } = render(Popover, { props: { open: true } });
    const trigger = container.querySelector(".cy-popover__trigger");
    expect(trigger?.getAttribute("aria-expanded")).toBe("true");
  });

  it("sets aria-expanded false when closed", () => {
    const { container } = render(Popover, { props: { open: false } });
    const trigger = container.querySelector(".cy-popover__trigger");
    expect(trigger?.getAttribute("aria-expanded")).toBe("false");
  });
});
