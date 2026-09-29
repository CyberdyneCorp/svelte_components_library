import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import TextInput from "./TextInput.svelte";

describe("TextInput", () => {
  it("renders with default props", () => {
    render(TextInput);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(TextInput, { props: { label: "Email", id: "email" } });
    const label = screen.getByText("Email");
    expect(label).toBeInTheDocument();
  });

  it("applies placeholder", () => {
    render(TextInput, { props: { placeholder: "Enter text" } });
    const input = screen.getByPlaceholderText("Enter text");
    expect(input).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(TextInput, { props: { error: "Required field" } });
    const error = screen.getByRole("alert");
    expect(error.textContent).toBe("Required field");
  });

  it("is disabled when disabled prop is true", () => {
    render(TextInput, { props: { disabled: true } });
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  describe("native attribute passthrough", () => {
    it("forwards autocomplete, spellcheck, maxlength, name and inputmode", () => {
      render(TextInput, {
        props: {
          autocomplete: "off",
          spellcheck: false,
          maxlength: 42,
          name: "wallet",
          inputmode: "text",
        },
      });
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("autocomplete", "off");
      expect(input).toHaveAttribute("spellcheck", "false");
      expect(input).toHaveAttribute("maxlength", "42");
      expect(input).toHaveAttribute("name", "wallet");
      expect(input).toHaveAttribute("inputmode", "text");
    });

    it("forwards data-* and aria-* rest props", () => {
      render(TextInput, {
        props: { "data-testid": "address", "aria-label": "Wallet address" },
      });
      const input = screen.getByTestId("address");
      expect(input.tagName).toBe("INPUT");
      expect(input).toHaveAccessibleName("Wallet address");
    });

    it("keeps component-managed attributes over rest props", () => {
      render(TextInput, {
        props: { id: "own", error: "Bad", "data-x": "1" },
      });
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("id", "own");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAttribute("data-x", "1");
    });

    it("uses only a consumer aria-describedby when there is no hint or error", () => {
      render(TextInput, { props: { "aria-describedby": "external" } });
      expect(screen.getByRole("textbox")).toHaveAttribute("aria-describedby", "external");
    });

    it("merges a consumer aria-describedby after the hint id", () => {
      render(TextInput, { props: { id: "addr", hint: "0x…", "aria-describedby": "external" } });
      expect(screen.getByRole("textbox")).toHaveAttribute("aria-describedby", "addr-hint external");
    });

    it("merges a consumer aria-describedby after the error id", () => {
      render(TextInput, { props: { id: "addr", error: "Invalid", "aria-describedby": "a b" } });
      expect(screen.getByRole("textbox")).toHaveAttribute("aria-describedby", "addr-error a b");
    });

    it("omits aria-describedby by default", () => {
      render(TextInput);
      expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-describedby");
    });
  });
});
