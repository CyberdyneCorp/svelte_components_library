import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { describe, it, expect, vi, afterEach } from "vitest";
import MaskedValue from "./MaskedValue.svelte";

const SECRET = "demo_secret_51HxQ9a7";
const text = (container: HTMLElement) =>
  container.querySelector(".cy-masked-value__text") as HTMLElement;

afterEach(() => {
  vi.useRealTimers();
});

describe("MaskedValue", () => {
  it("shows a fixed mask plus the last characters, and keeps the secret out of the DOM", () => {
    const { container } = render(MaskedValue, {
      props: { value: SECRET, label: "API key", revealable: true, copyable: true },
    });
    expect(text(container)).toHaveTextContent("••••••••Q9a7");
    expect(text(container)).toHaveAttribute("aria-hidden", "true");
    expect(container).toHaveTextContent("ending in Q9a7");
    expect(document.body.innerHTML).not.toContain(SECRET);
  });

  it("does not leak the length of the secret", () => {
    const { container: a } = render(MaskedValue, { props: { value: "short-secret-1" } });
    const { container: b } = render(MaskedValue, { props: { value: "a-much-longer-secret-value-2" } });
    expect(a.querySelector(".cy-masked-value__mask")?.textContent).toHaveLength(8);
    expect(b.querySelector(".cy-masked-value__mask")?.textContent).toHaveLength(8);
  });

  it("hides the trailing characters when they would be half the value or more", () => {
    const { container } = render(MaskedValue, { props: { value: "12345678" } });
    expect(text(container)).toHaveTextContent(/^•{8}$/);
    expect(container).toHaveTextContent("hidden");
    expect(document.body.innerHTML).not.toContain("5678");
  });

  it("respects custom mask settings and hidden text", () => {
    const { container } = render(MaskedValue, {
      props: {
        value: "4111111111111111",
        maskChar: "*",
        maskLength: 4,
        visibleEnd: 4,
        hiddenText: (end: string) => `final ${end}`,
      },
    });
    expect(text(container)).toHaveTextContent("****1111");
    expect(container).toHaveTextContent("final 1111");
  });

  it("has no toggle or copy button by default", () => {
    render(MaskedValue, { props: { value: SECRET } });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("reveals and hides with a pressed toggle", async () => {
    const { container } = render(MaskedValue, {
      props: { value: SECRET, label: "API key", revealable: true },
    });
    const show = screen.getByRole("button", { name: "Show API key" });
    expect(show).toHaveAttribute("aria-pressed", "false");
    await fireEvent.click(show);
    expect(text(container)).toHaveTextContent(SECRET);
    // One stable name; the pressed state says whether the value is shown.
    expect(show).toHaveAttribute("aria-pressed", "true");
    expect(show).toHaveAttribute("title", "Hide API key");
    await fireEvent.click(show);
    expect(document.body.innerHTML).not.toContain(SECRET);
  });

  it("uses translated toggle labels", () => {
    render(MaskedValue, {
      props: { value: SECRET, label: "chave", revealable: true, showLabel: "Mostrar" },
    });
    expect(screen.getByRole("button", { name: "Mostrar chave" })).toBeInTheDocument();
  });

  it("re-masks after autoHideAfter", async () => {
    vi.useFakeTimers();
    const { container } = render(MaskedValue, {
      props: { value: SECRET, label: "API key", revealable: true, autoHideAfter: 5000 },
    });
    await fireEvent.click(screen.getByRole("button", { name: "Show API key" }));
    expect(text(container)).toHaveTextContent(SECRET);
    await vi.advanceTimersByTimeAsync(4999);
    expect(text(container)).toHaveTextContent(SECRET);
    await vi.advanceTimersByTimeAsync(1);
    expect(document.body.innerHTML).not.toContain(SECRET);
  });

  it("starts revealed when bound revealed is true", () => {
    const { container } = render(MaskedValue, { props: { value: SECRET, revealed: true } });
    expect(text(container)).toHaveTextContent(SECRET);
  });

  it("copies the full value while hidden", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(MaskedValue, { props: { value: SECRET, label: "API key", copyable: true } });
    await fireEvent.click(screen.getByRole("button", { name: "Copy API key" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(SECRET));
  });
});
