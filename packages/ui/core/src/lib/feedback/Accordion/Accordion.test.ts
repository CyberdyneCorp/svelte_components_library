import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Accordion from "./Accordion.svelte";

const items = [
  { id: "1", title: "Section 1", content: "Content 1" },
  { id: "2", title: "Section 2", content: "Content 2" },
];

describe("Accordion", () => {
  it("renders all item titles", () => {
    render(Accordion, { props: { items } });
    expect(screen.getByText("Section 1")).toBeInTheDocument();
    expect(screen.getByText("Section 2")).toBeInTheDocument();
  });

  it("items start collapsed by default", () => {
    render(Accordion, { props: { items } });
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveAttribute("aria-expanded", "false");
  });

  it("expands item on click", async () => {
    render(Accordion, { props: { items } });
    const btn = screen.getByText("Section 1");
    await fireEvent.click(btn);
    expect(btn.closest("button")).toHaveAttribute("aria-expanded", "true");
  });

  it("respects defaultOpen prop", () => {
    render(Accordion, { props: { items, defaultOpen: ["2"] } });
    const buttons = screen.getAllByRole("button");
    expect(buttons[1]).toHaveAttribute("aria-expanded", "true");
  });

  it("has proper aria-controls linking", () => {
    render(Accordion, { props: { items } });
    const btn = screen.getAllByRole("button")[0];
    expect(btn).toHaveAttribute("aria-controls", "accordion-panel-1");
  });

  it("collapses an open item on click", async () => {
    render(Accordion, { props: { items, defaultOpen: ["1"] } });
    const btn = screen.getByText("Section 1").closest("button")!;
    expect(btn).toHaveAttribute("aria-expanded", "true");
    await fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  it("in single mode, opening one item closes the other", async () => {
    render(Accordion, { props: { items, defaultOpen: ["1"] } });
    const btn1 = screen.getByText("Section 1").closest("button")!;
    const btn2 = screen.getByText("Section 2").closest("button")!;
    expect(btn1).toHaveAttribute("aria-expanded", "true");
    await fireEvent.click(btn2);
    expect(btn2).toHaveAttribute("aria-expanded", "true");
    expect(btn1).toHaveAttribute("aria-expanded", "false");
  });

  it("in multiple mode, multiple items can be open", async () => {
    render(Accordion, { props: { items, multiple: true, defaultOpen: ["1"] } });
    const btn1 = screen.getByText("Section 1").closest("button")!;
    const btn2 = screen.getByText("Section 2").closest("button")!;
    expect(btn1).toHaveAttribute("aria-expanded", "true");
    await fireEvent.click(btn2);
    expect(btn1).toHaveAttribute("aria-expanded", "true");
    expect(btn2).toHaveAttribute("aria-expanded", "true");
  });

  it("in multiple mode, can close one without affecting others", async () => {
    render(Accordion, { props: { items, multiple: true, defaultOpen: ["1", "2"] } });
    const btn1 = screen.getByText("Section 1").closest("button")!;
    const btn2 = screen.getByText("Section 2").closest("button")!;
    await fireEvent.click(btn1);
    expect(btn1).toHaveAttribute("aria-expanded", "false");
    expect(btn2).toHaveAttribute("aria-expanded", "true");
  });

  it("renders content text for open items", async () => {
    render(Accordion, { props: { items, defaultOpen: ["1"] } });
    expect(screen.getByText("Content 1")).toBeInTheDocument();
  });

  it("renders panel with correct id", () => {
    render(Accordion, { props: { items } });
    const panel = document.getElementById("accordion-panel-1");
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveAttribute("role", "region");
    expect(panel).toHaveAttribute("aria-labelledby", "accordion-header-1");
  });

  it("renders with empty items", () => {
    const { container } = render(Accordion, { props: { items: [] } });
    expect(container.querySelector(".cy-accordion")).toBeInTheDocument();
    expect(container.querySelectorAll(".cy-accordion__item").length).toBe(0);
  });

  it("renders multiple defaultOpen items", () => {
    render(Accordion, { props: { items, multiple: true, defaultOpen: ["1", "2"] } });
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveAttribute("aria-expanded", "true");
    expect(buttons[1]).toHaveAttribute("aria-expanded", "true");
  });
});
