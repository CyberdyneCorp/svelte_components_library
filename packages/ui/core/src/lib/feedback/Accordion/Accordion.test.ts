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
});
