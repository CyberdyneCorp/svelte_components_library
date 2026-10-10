import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import PasswordInput from "./PasswordInput.svelte";

describe("PasswordInput", () => {
  it("renders with default props", () => {
    const { container } = render(PasswordInput);
    const input = container.querySelector("input");
    expect(input).toBeInTheDocument();
    expect(input?.type).toBe("password");
  });

  it("renders label when provided", () => {
    render(PasswordInput, { props: { label: "Password" } });
    const label = screen.getByText("Password");
    expect(label).toBeInTheDocument();
  });

  it("toggles password visibility on button click", async () => {
    const { container } = render(PasswordInput);
    const input = container.querySelector("input")!;
    const toggleBtn = screen.getByRole("button");
    expect(input.type).toBe("password");
    await fireEvent.click(toggleBtn);
    expect(input.type).toBe("text");
  });

  it("shows error message", () => {
    render(PasswordInput, { props: { error: "Too short" } });
    const error = screen.getByRole("alert");
    expect(error.textContent).toBe("Too short");
  });

  it("is disabled when disabled prop is true", () => {
    const { container } = render(PasswordInput, { props: { disabled: true } });
    const input = container.querySelector("input");
    expect(input).toBeDisabled();
  });

  describe("toggle labels", () => {
    it("hides the decorative eye icon from assistive technology", async () => {
      const { container } = render(PasswordInput);
      const icon = () => container.querySelector(".cy-password__toggle svg");
      expect(icon()).toHaveAttribute("aria-hidden", "true");
      await fireEvent.click(screen.getByRole("button", { name: "Show password" }));
      expect(icon()).toHaveAttribute("aria-hidden", "true");
    });

    it("names the toggle 'Show password' / 'Hide password' by default", async () => {
      render(PasswordInput);
      const toggle = screen.getByRole("button", { name: "Show password" });
      await fireEvent.click(toggle);
      expect(screen.getByRole("button", { name: "Hide password" })).toBe(toggle);
    });

    it("accepts translated showLabel and hideLabel", async () => {
      render(PasswordInput, { props: { showLabel: "Mostrar senha", hideLabel: "Ocultar senha" } });
      const toggle = screen.getByRole("button", { name: "Mostrar senha" });
      await fireEvent.click(toggle);
      expect(screen.getByRole("button", { name: "Ocultar senha" })).toBe(toggle);
    });
  });

  describe("native attributes", () => {
    it("forwards name and autocomplete to the input", () => {
      const { container } = render(PasswordInput, {
        props: { name: "root_password", autocomplete: "new-password" },
      });
      const input = container.querySelector("input")!;
      expect(input).toHaveAttribute("name", "root_password");
      expect(input).toHaveAttribute("autocomplete", "new-password");
    });

    it("uses the supplied id for the input, label and error description", () => {
      const { container } = render(PasswordInput, {
        props: { id: "pw-root", label: "Senha", error: "Curta demais" },
      });
      const input = container.querySelector("input")!;
      expect(input).toHaveAttribute("id", "pw-root");
      expect(screen.getByText("Senha")).toHaveAttribute("for", "pw-root");
      expect(input).toHaveAttribute("aria-describedby", "pw-root-error");
      expect(screen.getByRole("alert")).toHaveAttribute("id", "pw-root-error");
    });

    it("falls back to a generated id that still links the label", () => {
      const { container } = render(PasswordInput, { props: { label: "Password" } });
      const input = container.querySelector("input")!;
      expect(input.id).toMatch(/^cy-pw-/);
      expect(screen.getByText("Password")).toHaveAttribute("for", input.id);
    });
  });

  describe("generate action", () => {
    it("renders no generate button without ongenerate", () => {
      render(PasswordInput);
      expect(screen.getAllByRole("button")).toHaveLength(1);
      expect(screen.queryByRole("button", { name: "Generate" })).toBeNull();
    });

    it("sets the value to the callback's return when the generate button is clicked", async () => {
      const ongenerate = vi.fn(() => "s3cret-example");
      const { container } = render(PasswordInput, {
        props: {
          ongenerate,
          generateLabel: "Gerar",
          showLabel: "Mostrar senha",
          autocomplete: "new-password",
        },
      });
      const input = container.querySelector("input")!;
      expect(input.value).toBe("");

      await fireEvent.click(screen.getByRole("button", { name: "Gerar" }));

      expect(ongenerate).toHaveBeenCalledTimes(1);
      expect(input.value).toBe("s3cret-example");
      expect(screen.getByRole("button", { name: "Mostrar senha" })).toBeInTheDocument();
      expect(input).toHaveAttribute("autocomplete", "new-password");
    });

    it("labels the generate button 'Generate' by default and places it after the toggle", () => {
      render(PasswordInput, { props: { ongenerate: () => "x" } });
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2);
      expect(buttons[0]).toHaveAccessibleName("Show password");
      expect(buttons[1]).toHaveTextContent("Generate");
    });

    it("keeps the eye toggle working alongside the generate button", async () => {
      const { container } = render(PasswordInput, { props: { ongenerate: () => "x" } });
      const input = container.querySelector("input")!;
      await fireEvent.click(screen.getByRole("button", { name: "Show password" }));
      expect(input.type).toBe("text");
    });

    it("disables the generate button together with the field", () => {
      render(PasswordInput, { props: { ongenerate: () => "x", disabled: true } });
      expect(screen.getByRole("button", { name: "Generate" })).toBeDisabled();
    });
  });
});
