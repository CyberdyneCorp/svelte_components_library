import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import CopyableValue from "./CopyableValue.svelte";
import { truncateMiddle } from "./truncate.js";

const visible = (container: HTMLElement) =>
  container.querySelector(".cy-copyable-value__text") as HTMLElement;

describe("truncateMiddle", () => {
  it("keeps head and tail around an ellipsis", () => {
    expect(truncateMiddle("0x1234567890abcdef", 6, 4)).toBe("0x1234…cdef");
  });

  it("returns short text unchanged", () => {
    expect(truncateMiddle("abc", 6, 4)).toBe("abc");
    // head + tail + 1 characters: an ellipsis would save nothing
    expect(truncateMiddle("12345678901", 6, 4)).toBe("12345678901");
    expect(truncateMiddle("123456789012", 6, 4)).toBe("123456…9012");
  });

  it("supports a zero tail", () => {
    expect(truncateMiddle("abcdefghij", 3, 0)).toBe("abc…");
  });
});

describe("CopyableValue", () => {
  it("shows the middle-truncated text and exposes the full value to assistive tech", () => {
    const { container } = render(CopyableValue, { props: { value: "0x1234567890abcdef" } });
    expect(visible(container)).toHaveTextContent("0x1234…cdef");
    expect(visible(container)).toHaveAttribute("aria-hidden", "true");
    expect(visible(container)).toHaveAttribute("title", "0x1234567890abcdef");
    expect(container.querySelector(".cy-copyable-value__sr")).toHaveTextContent("0x1234567890abcdef");
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
  });

  it("does not truncate a short value", () => {
    const { container } = render(CopyableValue, { props: { value: "abc" } });
    expect(visible(container)).toHaveTextContent(/^abc$/);
  });

  it("leaves text whole for end and none truncation", () => {
    const long = "req_01HZX4Q9T7ABCDEFG";
    const { container } = render(CopyableValue, { props: { value: long, truncate: "end" } });
    expect(visible(container)).toHaveTextContent(long);
    expect(visible(container)).toHaveClass("cy-copyable-value__text--clip");
  });

  it("names the copy button after the label", () => {
    render(CopyableValue, { props: { value: "req_1", label: "request ID" } });
    expect(screen.getByRole("button", { name: "Copy request ID" })).toBeInTheDocument();
  });

  it("accepts an explicit copy label", () => {
    render(CopyableValue, { props: { value: "req_1", label: "ID", copyLabel: "Copiar ID" } });
    expect(screen.getByRole("button", { name: "Copiar ID" })).toBeInTheDocument();
  });

  it("copies value, not display", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const { container } = render(CopyableValue, {
      props: { value: "0xabcdef0123456789", display: "alice.eth" },
    });
    expect(visible(container)).toHaveTextContent("alice.eth");
    await fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("0xabcdef0123456789"));
  });

  it("can drop the monospace font", () => {
    const { container } = render(CopyableValue, { props: { value: "x", mono: false } });
    expect(container.querySelector(".cy-copyable-value")).not.toHaveClass("cy-copyable-value--mono");
  });
});
