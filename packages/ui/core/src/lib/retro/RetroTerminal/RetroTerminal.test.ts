import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import RetroTerminal from "./RetroTerminal.svelte";

describe("RetroTerminal", () => {
  it("has region role with aria label", () => {
    render(RetroTerminal);
    expect(screen.getByRole("region", { name: "Terminal" })).toBeInTheDocument();
  });

  it("renders welcome lines", () => {
    render(RetroTerminal, {
      props: { welcome: ["Welcome to CyberdyneOS!", "Type help."] },
    });
    expect(screen.getByText("Welcome to CyberdyneOS!")).toBeInTheDocument();
    expect(screen.getByText("Type help.")).toBeInTheDocument();
  });

  it("renders prompt", () => {
    render(RetroTerminal, { props: { prompt: "root@box $" } });
    expect(screen.getByText("root@box $")).toBeInTheDocument();
  });

  it("has accessible input", () => {
    render(RetroTerminal);
    expect(screen.getByLabelText("Terminal input")).toBeInTheDocument();
  });

  it("fires onCommand on Enter", async () => {
    const onCommand = vi.fn();
    render(RetroTerminal, { props: { onCommand } });
    const input = screen.getByLabelText("Terminal input") as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "help" } });
    await fireEvent.keyDown(input, { key: "Enter" });
    expect(onCommand).toHaveBeenCalledWith("help");
  });

  it("trims whitespace and ignores empty commands", async () => {
    const onCommand = vi.fn();
    render(RetroTerminal, { props: { onCommand } });
    const input = screen.getByLabelText("Terminal input") as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "   " } });
    await fireEvent.keyDown(input, { key: "Enter" });
    expect(onCommand).not.toHaveBeenCalled();
  });

  it("echoes command into output with prompt", async () => {
    render(RetroTerminal, { props: { prompt: "$" } });
    const input = screen.getByLabelText("Terminal input") as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "ls" } });
    await fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText("$ ls")).toBeInTheDocument();
  });

  it("clears input after submit", async () => {
    render(RetroTerminal);
    const input = screen.getByLabelText("Terminal input") as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "ls" } });
    await fireEvent.keyDown(input, { key: "Enter" });
    expect(input.value).toBe("");
  });

  it("navigates history with ArrowUp", async () => {
    render(RetroTerminal);
    const input = screen.getByLabelText("Terminal input") as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "cmd1" } });
    await fireEvent.keyDown(input, { key: "Enter" });
    await fireEvent.input(input, { target: { value: "cmd2" } });
    await fireEvent.keyDown(input, { key: "Enter" });
    await fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input.value).toBe("cmd2");
    await fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input.value).toBe("cmd1");
  });

  it("navigates history forward with ArrowDown", async () => {
    render(RetroTerminal);
    const input = screen.getByLabelText("Terminal input") as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "a" } });
    await fireEvent.keyDown(input, { key: "Enter" });
    await fireEvent.input(input, { target: { value: "b" } });
    await fireEvent.keyDown(input, { key: "Enter" });
    await fireEvent.keyDown(input, { key: "ArrowUp" });
    await fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input.value).toBe("a");
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.value).toBe("b");
  });

  it("renders provided lines", () => {
    render(RetroTerminal, {
      props: {
        lines: [
          { text: "output line", kind: "out" },
          { text: "error", kind: "err" },
        ],
      },
    });
    expect(screen.getByText("output line")).toBeInTheDocument();
    expect(screen.getByText("error")).toBeInTheDocument();
  });

  it("applies err kind class to lines", () => {
    const { container } = render(RetroTerminal, {
      props: { lines: [{ text: "x", kind: "err" }] },
    });
    expect(container.querySelector(".cy-rterm__line--err")).toBeInTheDocument();
  });

  it("is read-only when readOnly is true", async () => {
    const onCommand = vi.fn();
    render(RetroTerminal, { props: { readOnly: true, onCommand } });
    const input = screen.getByLabelText("Terminal input") as HTMLInputElement;
    expect(input).toHaveAttribute("readonly");
    await fireEvent.keyDown(input, { key: "Enter" });
    expect(onCommand).not.toHaveBeenCalled();
  });

  it("ArrowUp on empty history does nothing", async () => {
    render(RetroTerminal);
    const input = screen.getByLabelText("Terminal input") as HTMLInputElement;
    await fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input.value).toBe("");
  });

  it("placeholder applies to input", () => {
    render(RetroTerminal, { props: { placeholder: "type here" } });
    expect(screen.getByPlaceholderText("type here")).toBeInTheDocument();
  });
});
