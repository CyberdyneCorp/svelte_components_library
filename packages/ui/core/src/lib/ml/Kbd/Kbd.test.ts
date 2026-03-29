import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Kbd from "./Kbd.svelte";

describe("Kbd", () => {
  it("renders with default props", () => {
    render(Kbd);
    const el = document.querySelector(".cy-kbd");
    expect(el).toBeInTheDocument();
  });

  it("renders keyboard keys", () => {
    render(Kbd, { props: { keys: ["Ctrl", "C"] } });
    const kbds = document.querySelectorAll("kbd");
    expect(kbds.length).toBe(2);
    expect(screen.getByText("Ctrl")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("displays separator between keys", () => {
    render(Kbd, { props: { keys: ["Ctrl", "V"], separator: "+" } });
    expect(screen.getByText("+")).toBeInTheDocument();
  });

  it("applies size class", () => {
    render(Kbd, { props: { keys: ["A"], size: "sm" } });
    const el = document.querySelector(".cy-kbd--sm");
    expect(el).toBeInTheDocument();
  });
});
