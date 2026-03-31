import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import NumberInput from "./NumberInput.svelte";

describe("NumberInput", () => {
  it("renders with default props", () => {
    const { container } = render(NumberInput);
    expect(container.querySelector("input")).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(NumberInput, { props: { label: "Quantity" } });
    expect(screen.getByText("Quantity")).toBeInTheDocument();
  });

  it("does not render label when empty", () => {
    const { container } = render(NumberInput);
    expect(container.querySelector(".cy-ni__label")).not.toBeInTheDocument();
  });

  it("renders increment and decrement buttons", () => {
    render(NumberInput);
    expect(screen.getByRole("button", { name: "Decrease" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Increase" })).toBeInTheDocument();
  });

  it("shows error message with alert role", () => {
    render(NumberInput, { props: { error: "Out of range" } });
    expect(screen.getByRole("alert").textContent).toBe("Out of range");
  });

  it("applies error class", () => {
    const { container } = render(NumberInput, { props: { error: "err" } });
    expect(container.querySelector(".cy-ni--error")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    const { container } = render(NumberInput, { props: { disabled: true } });
    expect(container.querySelector("input")).toBeDisabled();
  });

  it("applies disabled class", () => {
    const { container } = render(NumberInput, { props: { disabled: true } });
    expect(container.querySelector(".cy-ni--disabled")).toBeInTheDocument();
  });

  it("disables buttons when disabled", () => {
    render(NumberInput, { props: { disabled: true } });
    expect(screen.getByRole("button", { name: "Decrease" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Increase" })).toBeDisabled();
  });

  it("sets aria-invalid when error is provided", () => {
    const { container } = render(NumberInput, { props: { error: "err" } });
    const input = container.querySelector("input");
    expect(input?.getAttribute("aria-invalid")).toBe("true");
  });

  it("displays formatted value", () => {
    const { container } = render(NumberInput, { props: { value: 42, precision: 0 } });
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("42");
  });

  it("displays value with precision", () => {
    const { container } = render(NumberInput, { props: { value: 3.14, precision: 2 } });
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("3.14");
  });

  it("shows unit when provided", () => {
    const { container } = render(NumberInput, { props: { unit: "kg" } });
    expect(container.querySelector(".cy-ni__unit")?.textContent).toBe("kg");
  });

  it("does not show unit when empty", () => {
    const { container } = render(NumberInput);
    expect(container.querySelector(".cy-ni__unit")).not.toBeInTheDocument();
  });

  it("increments value on increase button click", async () => {
    const { container } = render(NumberInput, { props: { value: 5, step: 1 } });
    const btn = screen.getByRole("button", { name: "Increase" });
    await fireEvent.click(btn);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("6");
  });

  it("decrements value on decrease button click", async () => {
    const { container } = render(NumberInput, { props: { value: 5, step: 1 } });
    const btn = screen.getByRole("button", { name: "Decrease" });
    await fireEvent.click(btn);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("4");
  });

  it("increments by step amount", async () => {
    const { container } = render(NumberInput, { props: { value: 10, step: 5 } });
    const btn = screen.getByRole("button", { name: "Increase" });
    await fireEvent.click(btn);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("15");
  });

  it("decrements by step amount", async () => {
    const { container } = render(NumberInput, { props: { value: 10, step: 5 } });
    const btn = screen.getByRole("button", { name: "Decrease" });
    await fireEvent.click(btn);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("5");
  });

  it("clamps value to max on increment", async () => {
    const { container } = render(NumberInput, { props: { value: 9, step: 5, max: 10 } });
    const btn = screen.getByRole("button", { name: "Increase" });
    await fireEvent.click(btn);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("10");
  });

  it("clamps value to min on decrement", async () => {
    const { container } = render(NumberInput, { props: { value: 2, step: 5, min: 0 } });
    const btn = screen.getByRole("button", { name: "Decrease" });
    await fireEvent.click(btn);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("0");
  });

  it("does not increment when disabled", async () => {
    const { container } = render(NumberInput, {
      props: { value: 5, step: 1, disabled: true },
    });
    const btn = screen.getByRole("button", { name: "Increase" });
    await fireEvent.click(btn);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("5");
  });

  it("does not decrement when disabled", async () => {
    const { container } = render(NumberInput, {
      props: { value: 5, step: 1, disabled: true },
    });
    const btn = screen.getByRole("button", { name: "Decrease" });
    await fireEvent.click(btn);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("5");
  });

  it("increments on ArrowUp key", async () => {
    const { container } = render(NumberInput, { props: { value: 5, step: 1 } });
    const input = container.querySelector("input")!;
    await fireEvent.keyDown(input, { key: "ArrowUp" });
    expect((input as HTMLInputElement).value).toBe("6");
  });

  it("decrements on ArrowDown key", async () => {
    const { container } = render(NumberInput, { props: { value: 5, step: 1 } });
    const input = container.querySelector("input")!;
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    expect((input as HTMLInputElement).value).toBe("4");
  });

  it("handles manual input of valid number", async () => {
    const { container } = render(NumberInput, { props: { value: 0 } });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "42" } });
    expect((input as HTMLInputElement).value).toBe("42");
  });

  it("clamps manual input to max", async () => {
    const { container } = render(NumberInput, { props: { value: 0, max: 10 } });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "50" } });
    expect((input as HTMLInputElement).value).toBe("10");
  });

  it("clamps manual input to min", async () => {
    const { container } = render(NumberInput, { props: { value: 5, min: 0 } });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "-5" } });
    expect((input as HTMLInputElement).value).toBe("0");
  });

  it("does not update bound value for non-numeric input", async () => {
    const { container } = render(NumberInput, { props: { value: 5, step: 1 } });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "abc" } });
    // The internal value prop should remain 5, so increment still works from 5
    const btn = screen.getByRole("button", { name: "Increase" });
    await fireEvent.click(btn);
    expect((input as HTMLInputElement).value).toBe("6");
  });

  it("applies precision to manual input", async () => {
    const { container } = render(NumberInput, { props: { value: 0, precision: 2 } });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "3.14159" } });
    expect((input as HTMLInputElement).value).toBe("3.14");
  });

  it("applies sm size class", () => {
    const { container } = render(NumberInput, { props: { size: "sm" } });
    expect(container.querySelector(".cy-ni--sm")).toBeInTheDocument();
  });

  it("applies md size class by default", () => {
    const { container } = render(NumberInput);
    expect(container.querySelector(".cy-ni--md")).toBeInTheDocument();
  });

  it("handles precision with increment", async () => {
    const { container } = render(NumberInput, {
      props: { value: 1.5, step: 0.1, precision: 1 },
    });
    const btn = screen.getByRole("button", { name: "Increase" });
    await fireEvent.click(btn);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("1.6");
  });

  it("handles precision with decrement", async () => {
    const { container } = render(NumberInput, {
      props: { value: 1.5, step: 0.1, precision: 1 },
    });
    const btn = screen.getByRole("button", { name: "Decrease" });
    await fireEvent.click(btn);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("1.4");
  });

  it("does not go below min via keyboard", async () => {
    const { container } = render(NumberInput, {
      props: { value: 0, step: 1, min: 0 },
    });
    const input = container.querySelector("input")!;
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    expect((input as HTMLInputElement).value).toBe("0");
  });

  it("does not go above max via keyboard", async () => {
    const { container } = render(NumberInput, {
      props: { value: 10, step: 1, max: 10 },
    });
    const input = container.querySelector("input")!;
    await fireEvent.keyDown(input, { key: "ArrowUp" });
    expect((input as HTMLInputElement).value).toBe("10");
  });
});
