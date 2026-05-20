import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import Chatbox from "./Chatbox.svelte";

describe("Chatbox", () => {
  it("renders textarea with placeholder", () => {
    render(Chatbox, { props: { placeholder: "Type here..." } });
    expect(screen.getByPlaceholderText("Type here...")).toBeInTheDocument();
  });

  it("renders send button", () => {
    render(Chatbox);
    expect(screen.getByLabelText("Send message")).toBeInTheDocument();
  });

  it("disables send button when value is empty", () => {
    render(Chatbox, { props: { value: "" } });
    const sendBtn = screen.getByLabelText("Send message");
    expect(sendBtn).toBeDisabled();
  });

  it("disables input when disabled prop is true", () => {
    const { container } = render(Chatbox, { props: { disabled: true } });
    const textarea = container.querySelector("textarea");
    expect(textarea).toBeDisabled();
  });

  it("shows spinner when loading", () => {
    const { container } = render(Chatbox, { props: { loading: true } });
    const spinner = container.querySelector(".cy-chatbox__spinner");
    expect(spinner).toBeInTheDocument();
  });

  it("calls onsend with trimmed value when send button is clicked", async () => {
    const onsend = vi.fn();
    render(Chatbox, { props: { value: "  hello world  ", onsend } });
    const sendBtn = screen.getByLabelText("Send message");
    await fireEvent.click(sendBtn);
    expect(onsend).toHaveBeenCalledWith("hello world", []);
  });

  it("does not call onsend when value is only whitespace", async () => {
    const onsend = vi.fn();
    render(Chatbox, { props: { value: "   ", onsend } });
    const sendBtn = screen.getByLabelText("Send message");
    await fireEvent.click(sendBtn);
    expect(onsend).not.toHaveBeenCalled();
  });

  it("does not call onsend when disabled", async () => {
    const onsend = vi.fn();
    render(Chatbox, { props: { value: "hello", disabled: true, onsend } });
    const sendBtn = screen.getByLabelText("Send message");
    await fireEvent.click(sendBtn);
    expect(onsend).not.toHaveBeenCalled();
  });

  it("does not call onsend when loading", async () => {
    const onsend = vi.fn();
    render(Chatbox, { props: { value: "hello", loading: true, onsend } });
    const sendBtn = screen.getByLabelText("Sending...");
    await fireEvent.click(sendBtn);
    expect(onsend).not.toHaveBeenCalled();
  });

  it("sends message on Enter key (without shift)", async () => {
    const onsend = vi.fn();
    const { container } = render(Chatbox, { props: { value: "hello", onsend } });
    const textarea = container.querySelector("textarea")!;
    await fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    expect(onsend).toHaveBeenCalledWith("hello", []);
  });

  it("does not send on Shift+Enter", async () => {
    const onsend = vi.fn();
    const { container } = render(Chatbox, { props: { value: "hello", onsend } });
    const textarea = container.querySelector("textarea")!;
    await fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    expect(onsend).not.toHaveBeenCalled();
  });

  it("renders attach button when onattach is provided", () => {
    const onattach = vi.fn();
    render(Chatbox, { props: { onattach } });
    expect(screen.getByLabelText("Attach file")).toBeInTheDocument();
  });

  it("does not render attach button when onattach is not provided", () => {
    render(Chatbox);
    expect(screen.queryByLabelText("Attach file")).not.toBeInTheDocument();
  });

  it("fires onattach when files are selected via the picker", async () => {
    const onattach = vi.fn();
    const { container } = render(Chatbox, { props: { onattach } });
    const fileInput = container.querySelector(
      "input[type=file]",
    ) as HTMLInputElement;
    const file = new File(["hello"], "hello.txt", { type: "text/plain" });
    await fireEvent.change(fileInput, { target: { files: [file] } });
    expect(onattach).toHaveBeenCalledOnce();
    expect(onattach.mock.calls[0][0][0].name).toBe("hello.txt");
  });

  it("rejects oversize files via onerror and does not stage them", async () => {
    const onattach = vi.fn();
    const onerror = vi.fn();
    const { container } = render(Chatbox, {
      props: { onattach, onerror, maxSizeBytes: 4 },
    });
    const fileInput = container.querySelector(
      "input[type=file]",
    ) as HTMLInputElement;
    const big = new File(["abcdefghij"], "big.txt", { type: "text/plain" });
    await fireEvent.change(fileInput, { target: { files: [big] } });
    expect(onattach).not.toHaveBeenCalled();
    expect(onerror).toHaveBeenCalledOnce();
  });

  it("shows loading aria-label when loading", () => {
    render(Chatbox, { props: { loading: true, value: "test" } });
    expect(screen.getByLabelText("Sending...")).toBeInTheDocument();
  });

  it("applies disabled class when disabled", () => {
    const { container } = render(Chatbox, { props: { disabled: true } });
    const box = container.querySelector(".cy-chatbox--disabled");
    expect(box).toBeInTheDocument();
  });

  it("disables send button when loading", () => {
    render(Chatbox, { props: { loading: true, value: "test" } });
    expect(screen.getByLabelText("Sending...")).toBeDisabled();
  });

  it("enables send button when value is non-empty and not disabled/loading", () => {
    render(Chatbox, { props: { value: "hello" } });
    expect(screen.getByLabelText("Send message")).not.toBeDisabled();
  });

  it("auto-grows textarea on input", async () => {
    const { container } = render(Chatbox);
    const textarea = container.querySelector("textarea")!;
    await fireEvent.input(textarea, { target: { value: "line1\nline2\nline3" } });
    // autoGrow is called on input; just verify no error occurs
    expect(textarea).toBeInTheDocument();
  });
});
