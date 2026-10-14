import { fireEvent, render, screen } from "@testing-library/svelte";
import { createRawSnippet, tick } from "svelte";
import { describe, it, expect, vi } from "vitest";
import ConfirmAction from "./ConfirmAction.svelte";

const body = createRawSnippet(() => ({ render: () => `<p>This removes every deployment.</p>` }));

describe("ConfirmAction", () => {
  it("calls onconfirm directly at the click level", async () => {
    const onconfirm = vi.fn();
    render(ConfirmAction, { props: { label: "Clear cache", level: "click", onconfirm } });
    await fireEvent.click(screen.getByRole("button", { name: "Clear cache" }));
    expect(onconfirm).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("asks in a danger dialog at the confirm level", async () => {
    const onconfirm = vi.fn();
    render(ConfirmAction, { props: { label: "Delete project", onconfirm, children: body } });
    await fireEvent.click(screen.getByRole("button", { name: "Delete project" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("This removes every deployment.");
    expect(onconfirm).not.toHaveBeenCalled();
    const confirm = screen.getAllByRole("button", { name: "Delete project" }).at(-1)!;
    expect(confirm).toHaveClass("cy-dialog__btn--danger");
    await fireEvent.click(confirm);
    expect(onconfirm).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls oncancel and not onconfirm on Escape", async () => {
    const onconfirm = vi.fn();
    const oncancel = vi.fn();
    render(ConfirmAction, { props: { label: "Revoke key", onconfirm, oncancel } });
    await fireEvent.click(screen.getByRole("button", { name: "Revoke key" }));
    await fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(oncancel).toHaveBeenCalledOnce();
    expect(onconfirm).not.toHaveBeenCalled();
  });

  it("enables confirm only when the exact phrase is typed", async () => {
    const onconfirm = vi.fn();
    render(ConfirmAction, {
      props: { label: "Delete project", level: "type", confirmText: "acme-prod", confirmLabel: "Delete forever", onconfirm },
    });
    await fireEvent.click(screen.getByRole("button", { name: "Delete project" }));
    const input = screen.getByRole("textbox", { name: 'Type "acme-prod" to confirm' });
    const confirm = screen.getByRole("button", { name: "Delete forever" });

    await fireEvent.input(input, { target: { value: "acme-pro" } });
    expect(confirm).toBeDisabled();
    await fireEvent.input(input, { target: { value: "ACME-PROD" } });
    expect(confirm).toBeDisabled();
    await fireEvent.input(input, { target: { value: " acme-prod " } });
    expect(confirm).toBeEnabled();

    await fireEvent.click(confirm);
    expect(onconfirm).toHaveBeenCalledOnce();
  });

  it("clears the typed phrase each time the dialog opens", async () => {
    render(ConfirmAction, { props: { label: "Delete", level: "type", confirmText: "db-1", cancelLabel: "Keep" } });
    await fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await fireEvent.input(screen.getByRole("textbox"), { target: { value: "db-1" } });
    await fireEvent.click(screen.getByRole("button", { name: "Keep" }));
    await fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(screen.getAllByRole("button", { name: "Delete" }).at(-1)).toBeDisabled();
  });

  it("focuses the typing field on open and returns focus to the trigger on close", async () => {
    render(ConfirmAction, { props: { label: "Delete", level: "type", confirmText: "x" } });
    const trigger = screen.getByRole("button", { name: "Delete" });
    await fireEvent.click(trigger);
    await tick();
    expect(screen.getByRole("textbox")).toHaveFocus();
    await fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await tick();
    await tick();
    expect(trigger).toHaveFocus();
  });

  it("uses a custom title and prompt", async () => {
    render(ConfirmAction, {
      props: { label: "Excluir", title: "Excluir projeto?", level: "type", confirmText: "acme", typePrompt: "Digite acme" },
    });
    await fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    expect(screen.getByRole("heading", { name: "Excluir projeto?" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Digite acme" })).toBeInTheDocument();
  });

  it("renders a natively disabled trigger", () => {
    render(ConfirmAction, { props: { label: "Run", disabled: true } });
    expect(screen.getByRole("button", { name: "Run" })).toBeDisabled();
  });
});
