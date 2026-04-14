import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import PixelInput from "./PixelInput.svelte";

describe("PixelInput", () => {
  it("renders textbox", () => {
    render(PixelInput);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
  it("renders label", () => {
    render(PixelInput, { props: { label: "Name" } });
    expect(screen.getByText("Name")).toBeInTheDocument();
  });
  it("renders required marker", () => {
    render(PixelInput, { props: { label: "Email", required: true } });
    expect(screen.getByText("*")).toBeInTheDocument();
  });
  it("shows placeholder", () => {
    render(PixelInput, { props: { placeholder: "hello" } });
    expect(screen.getByPlaceholderText("hello")).toBeInTheDocument();
  });
  it("applies password type", () => {
    const { container } = render(PixelInput, { props: { type: "password" } });
    expect(container.querySelector("input[type='password']")).toBeInTheDocument();
  });
  it("fires onInput", async () => {
    const onInput = vi.fn();
    render(PixelInput, { props: { onInput } });
    await fireEvent.input(screen.getByRole("textbox"), { target: { value: "hi" } });
    expect(onInput).toHaveBeenCalledWith("hi");
  });
  it("fires onChange", async () => {
    const onChange = vi.fn();
    render(PixelInput, { props: { onChange } });
    await fireEvent.change(screen.getByRole("textbox"), { target: { value: "bye" } });
    expect(onChange).toHaveBeenCalledWith("bye");
  });
  it("disables input", () => {
    render(PixelInput, { props: { disabled: true } });
    expect(screen.getByRole("textbox")).toBeDisabled();
  });
  it("renders error message", () => {
    render(PixelInput, { props: { error: "Required" } });
    expect(screen.getByText("Required")).toBeInTheDocument();
  });
  it("sets aria-invalid when error", () => {
    render(PixelInput, { props: { error: "bad" } });
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });
  it("associates describedby with error", () => {
    render(PixelInput, { props: { id: "f", error: "bad" } });
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-describedby", "f-err");
  });
  it("uses ariaLabel when no label", () => {
    render(PixelInput, { props: { ariaLabel: "Email" } });
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });
  it("forwards name", () => {
    render(PixelInput, { props: { name: "email" } });
    expect(screen.getByRole("textbox")).toHaveAttribute("name", "email");
  });
});
