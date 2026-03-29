import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import TransactionList from "./TransactionList.svelte";

describe("TransactionList", () => {
  const transactions = [
    { hash: "0xabc123def456", type: "send" as const, amount: "1.5", symbol: "ETH", status: "confirmed" as const, timestamp: "2024-01-01" },
    { hash: "0xdef789abc012", type: "receive" as const, amount: "100", symbol: "USDC", status: "pending" as const, timestamp: "2024-01-02" },
  ];

  it("shows empty state when no transactions", () => {
    render(TransactionList, { props: { transactions: [] } });
    expect(screen.getByText("No transactions yet")).toBeInTheDocument();
  });

  it("renders transaction rows", () => {
    render(TransactionList, { props: { transactions } });
    expect(screen.getByText("Sent")).toBeInTheDocument();
    expect(screen.getByText("Received")).toBeInTheDocument();
  });

  it("displays transaction amounts", () => {
    render(TransactionList, { props: { transactions } });
    expect(screen.getByText(/1\.5 ETH/)).toBeInTheDocument();
  });

  it("displays transaction status", () => {
    render(TransactionList, { props: { transactions } });
    expect(screen.getByText("confirmed")).toBeInTheDocument();
    expect(screen.getByText("pending")).toBeInTheDocument();
  });

  it("truncates transaction hashes", () => {
    render(TransactionList, { props: { transactions } });
    expect(screen.getByText("0xabc1...f456")).toBeInTheDocument();
  });
});
