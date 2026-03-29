import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import TransactionConfirm from "./TransactionConfirm.svelte";

describe("TransactionConfirm", () => {
  const defaultProps = {
    open: true,
    type: "send" as const,
    amount: "1.5",
    token: "ETH",
    fromLabel: "0x1234...5678",
    toLabel: "0xabcd...ef01",
    gasEstimate: "0.002",
  };

  it("does not render when open is false", () => {
    const { container } = render(TransactionConfirm, { props: { open: false } });
    const overlay = container.querySelector(".cy-tx-confirm__overlay");
    expect(overlay).not.toBeInTheDocument();
  });

  it("renders dialog when open", () => {
    render(TransactionConfirm, { props: defaultProps });
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
  });

  it("displays amount and token separately", () => {
    const { container } = render(TransactionConfirm, { props: defaultProps });
    const amount = container.querySelector(".cy-tx-confirm__amount");
    const token = container.querySelector(".cy-tx-confirm__token");
    expect(amount?.textContent).toBe("1.5");
    expect(token?.textContent).toBe("ETH");
  });

  it("has confirm and cancel buttons", () => {
    const { container } = render(TransactionConfirm, { props: defaultProps });
    const cancelBtn = container.querySelector(".cy-tx-confirm__btn--cancel");
    const confirmBtn = container.querySelector(".cy-tx-confirm__btn--confirm");
    expect(cancelBtn).toBeInTheDocument();
    expect(confirmBtn).toBeInTheDocument();
  });

  it("calls onconfirm when confirm button is clicked", async () => {
    const onconfirm = vi.fn();
    const { container } = render(TransactionConfirm, { props: { ...defaultProps, onconfirm } });
    const confirmBtn = container.querySelector(".cy-tx-confirm__btn--confirm")!;
    await fireEvent.click(confirmBtn);
    expect(onconfirm).toHaveBeenCalledOnce();
  });
});
