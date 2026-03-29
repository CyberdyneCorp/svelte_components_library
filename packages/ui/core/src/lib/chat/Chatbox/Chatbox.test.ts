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
});
