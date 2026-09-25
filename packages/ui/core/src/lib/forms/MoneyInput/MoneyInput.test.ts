import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import MoneyInput from "./MoneyInput.svelte";

const usd = { currency: "USD", locale: "en-US" };

function field(container: HTMLElement): HTMLInputElement {
  return container.querySelector(".cy-mi__field") as HTMLInputElement;
}

async function type(input: HTMLInputElement, text: string) {
  await fireEvent.focus(input);
  await fireEvent.input(input, { target: { value: text } });
}

describe("MoneyInput", () => {
  it("renders an empty decimal-mode text field by default", () => {
    const { container } = render(MoneyInput, { props: usd });
    const input = field(container);
    expect(input.value).toBe("");
    expect(input.getAttribute("inputmode")).toBe("decimal");
    expect(input.type).toBe("text");
  });

  it("ties the label to the input", () => {
    render(MoneyInput, { props: { ...usd, label: "Amount" } });
    expect(screen.getByLabelText("Amount")).toBeInstanceOf(HTMLInputElement);
  });

  it("uses the provided id", () => {
    const { container } = render(MoneyInput, { props: { ...usd, id: "rent" } });
    expect(field(container).id).toBe("rent");
  });

  it("shows the value formatted in the locale currency style when not focused", () => {
    const { container } = render(MoneyInput, { props: { ...usd, value: "1234.5" } });
    expect(field(container).value).toBe("$1,234.50");
  });

  it("formats EUR for de-DE", () => {
    const { container } = render(MoneyInput, { props: { currency: "EUR", locale: "de-DE", value: "1234.56" } });
    expect(field(container).value).toBe("1.234,56 €");
  });

  it("shows the plain editable number with the locale decimal mark on focus", async () => {
    const { container } = render(MoneyInput, { props: { currency: "EUR", locale: "de-DE", value: "1234.56" } });
    await fireEvent.focus(field(container));
    expect(field(container).value).toBe("1234,56");
    expect(container.querySelector(".cy-mi__currency")?.textContent).toBe("EUR");
  });

  it("emits a canonical decimal string while typing", async () => {
    const onchange = vi.fn();
    const { container } = render(MoneyInput, { props: { ...usd, onchange } });
    await type(field(container), "1,234.5");
    expect(onchange).toHaveBeenLastCalledWith("1234.50");
  });

  it("round-trips 12345678901234.56 exactly", async () => {
    const onchange = vi.fn();
    const { container } = render(MoneyInput, { props: { ...usd, onchange } });
    const input = field(container);
    await type(input, "12345678901234.56");
    expect(onchange).toHaveBeenLastCalledWith("12345678901234.56");
    await fireEvent.blur(input);
    expect(input.value).toBe("$12,345,678,901,234.56");
  });

  it("strips rejected characters from the field", async () => {
    const { container } = render(MoneyInput, { props: usd });
    const input = field(container);
    await type(input, "12a.5$");
    expect(input.value).toBe("12.5");
  });

  it("drops a minus sign unless allowNegative", async () => {
    const onchange = vi.fn();
    const { container } = render(MoneyInput, { props: { ...usd, onchange } });
    await type(field(container), "-12");
    expect(onchange).toHaveBeenLastCalledWith("12.00");
  });

  it("accepts negatives when allowNegative", async () => {
    const onchange = vi.fn();
    const { container } = render(MoneyInput, { props: { ...usd, allowNegative: true, onchange } });
    await type(field(container), "-12,5");
    expect(onchange).toHaveBeenLastCalledWith("-12.50");
  });

  it("limits fraction digits to the currency's minor units", async () => {
    const onchange = vi.fn();
    const { container } = render(MoneyInput, { props: { currency: "JPY", locale: "ja-JP", onchange } });
    await type(field(container), "1.500");
    expect(onchange).toHaveBeenLastCalledWith("1500");
  });

  it("emits null when cleared", async () => {
    const onchange = vi.fn();
    const { container } = render(MoneyInput, { props: { ...usd, value: "5.00", onchange } });
    await type(field(container), "");
    expect(onchange).toHaveBeenLastCalledWith(null);
  });

  it("does not emit when the canonical value is unchanged", async () => {
    const onchange = vi.fn();
    const { container } = render(MoneyInput, { props: { ...usd, value: "5.00", onchange } });
    await type(field(container), "5.0");
    expect(onchange).not.toHaveBeenCalled();
  });

  it("clamps to min and max on blur", async () => {
    const onchange = vi.fn();
    const { container } = render(MoneyInput, { props: { ...usd, min: "10", max: "100", onchange } });
    const input = field(container);
    await type(input, "5");
    await fireEvent.blur(input);
    expect(onchange).toHaveBeenLastCalledWith("10.00");
    await type(input, "500");
    await fireEvent.blur(input);
    expect(onchange).toHaveBeenLastCalledWith("100.00");
  });

  it("renders a hidden input with the canonical value when named", () => {
    const { container } = render(MoneyInput, { props: { ...usd, name: "amount", value: "42.00" } });
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden.name).toBe("amount");
    expect(hidden.value).toBe("42.00");
  });

  it("omits the hidden input when unnamed", () => {
    const { container } = render(MoneyInput, { props: usd });
    expect(container.querySelector('input[type="hidden"]')).not.toBeInTheDocument();
  });

  it("shows an accessible error linked to the input", () => {
    const { container } = render(MoneyInput, { props: { ...usd, id: "amt", error: "Too high" } });
    const input = field(container);
    expect(screen.getByRole("alert").textContent).toBe("Too high");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe("amt-error");
    expect(container.querySelector(".cy-mi--error")).toBeInTheDocument();
  });

  it("links both hint and error through aria-describedby", () => {
    const { container } = render(MoneyInput, { props: { ...usd, id: "amt", hint: "Monthly", error: "Required" } });
    expect(field(container).getAttribute("aria-describedby")).toBe("amt-hint amt-error");
    expect(screen.getByText("Monthly").id).toBe("amt-hint");
  });

  it("has no aria-describedby without hint or error", () => {
    const { container } = render(MoneyInput, { props: usd });
    expect(field(container).hasAttribute("aria-describedby")).toBe(false);
    expect(field(container).getAttribute("aria-invalid")).toBe("false");
  });

  it("supports disabled and required", () => {
    const { container } = render(MoneyInput, { props: { ...usd, label: "Amount", disabled: true, required: true } });
    const input = field(container);
    expect(input).toBeDisabled();
    expect(input).toBeRequired();
    expect(container.querySelector(".cy-mi--disabled")).toBeInTheDocument();
    expect(container.querySelector(".cy-mi__required")?.getAttribute("aria-hidden")).toBe("true");
  });
});
