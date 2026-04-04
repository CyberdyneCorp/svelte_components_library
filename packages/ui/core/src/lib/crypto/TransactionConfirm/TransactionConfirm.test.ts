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

  it("calls oncancel when cancel button is clicked", async () => {
    const oncancel = vi.fn();
    const { container } = render(TransactionConfirm, { props: { ...defaultProps, oncancel } });
    const cancelBtn = container.querySelector(".cy-tx-confirm__btn--cancel")!;
    await fireEvent.click(cancelBtn);
    expect(oncancel).toHaveBeenCalledOnce();
  });

  it("closes dialog when cancel button is clicked", async () => {
    const { container } = render(TransactionConfirm, { props: defaultProps });
    const cancelBtn = container.querySelector(".cy-tx-confirm__btn--cancel")!;
    await fireEvent.click(cancelBtn);
    const overlay = container.querySelector(".cy-tx-confirm__overlay");
    expect(overlay).not.toBeInTheDocument();
  });

  it("displays correct title for send type", () => {
    const { container } = render(TransactionConfirm, { props: defaultProps });
    const title = container.querySelector(".cy-tx-confirm__title");
    expect(title?.textContent).toBe("Confirm Send");
  });

  it("displays correct title for swap type", () => {
    const { container } = render(TransactionConfirm, { props: { ...defaultProps, type: "swap" } });
    const title = container.querySelector(".cy-tx-confirm__title");
    expect(title?.textContent).toBe("Confirm Swap");
  });

  it("displays correct title for stake type", () => {
    const { container } = render(TransactionConfirm, { props: { ...defaultProps, type: "stake" } });
    const title = container.querySelector(".cy-tx-confirm__title");
    expect(title?.textContent).toBe("Confirm Stake");
  });

  it("displays correct title for approve type", () => {
    const { container } = render(TransactionConfirm, { props: { ...defaultProps, type: "approve" } });
    const title = container.querySelector(".cy-tx-confirm__title");
    expect(title?.textContent).toBe("Confirm Approve");
  });

  it("displays gas estimate when provided", () => {
    render(TransactionConfirm, { props: defaultProps });
    expect(screen.getByText("Estimated Gas")).toBeInTheDocument();
    expect(screen.getByText("0.002 ETH")).toBeInTheDocument();
  });

  it("hides gas estimate when not provided", () => {
    const { gasEstimate, ...noGas } = defaultProps;
    render(TransactionConfirm, { props: noGas });
    expect(screen.queryByText("Estimated Gas")).not.toBeInTheDocument();
  });

  it("displays network name", () => {
    render(TransactionConfirm, { props: defaultProps });
    expect(screen.getByText("Ethereum")).toBeInTheDocument();
  });

  it("displays custom network name", () => {
    render(TransactionConfirm, { props: { ...defaultProps, networkName: "Polygon" } });
    expect(screen.getByText("Polygon")).toBeInTheDocument();
  });

  it("truncates long addresses", () => {
    const longFrom = "0x1234567890abcdef1234567890abcdef12345678";
    const longTo = "0xabcdef1234567890abcdef1234567890abcdef12";
    render(TransactionConfirm, {
      props: { ...defaultProps, fromLabel: longFrom, toLabel: longTo },
    });
    expect(screen.getByText("0x1234...5678")).toBeInTheDocument();
    expect(screen.getByText("0xabcd...ef12")).toBeInTheDocument();
  });

  it("shows short addresses without truncation", () => {
    render(TransactionConfirm, {
      props: { ...defaultProps, fromLabel: "0x1234", toLabel: "0xabcd" },
    });
    expect(screen.getByText("0x1234")).toBeInTheDocument();
    expect(screen.getByText("0xabcd")).toBeInTheDocument();
  });

  it("hides addresses section when fromLabel/toLabel are empty", () => {
    const { container } = render(TransactionConfirm, {
      props: { ...defaultProps, fromLabel: "", toLabel: "" },
    });
    const addresses = container.querySelector(".cy-tx-confirm__addresses");
    expect(addresses).not.toBeInTheDocument();
  });

  it("displays warning message", () => {
    render(TransactionConfirm, { props: defaultProps });
    expect(screen.getByText("Please verify all details before confirming")).toBeInTheDocument();
  });

  it("closes on overlay click", async () => {
    const oncancel = vi.fn();
    const { container } = render(TransactionConfirm, { props: { ...defaultProps, oncancel } });
    const overlay = container.querySelector(".cy-tx-confirm__overlay") as HTMLElement;
    await fireEvent.click(overlay);
    expect(oncancel).toHaveBeenCalledOnce();
  });

  it("displays custom gas currency", () => {
    render(TransactionConfirm, {
      props: { ...defaultProps, gasCurrency: "MATIC" },
    });
    expect(screen.getByText("0.002 MATIC")).toBeInTheDocument();
  });
});
