import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import ProposalRow from "./ProposalRow.svelte";

const base = { id: 23, title: "Upgrade Neural Network" };

describe("ProposalRow", () => {
  it("renders id and title", () => {
    render(ProposalRow, { props: base });
    expect(screen.getByText("#23: Upgrade Neural Network")).toBeInTheDocument();
  });
  it("has accessible label", () => {
    render(ProposalRow, { props: base });
    expect(screen.getByLabelText("Proposal 23: Upgrade Neural Network")).toBeInTheDocument();
  });
  it("renders progress percentage", () => {
    render(ProposalRow, { props: { ...base, progress: 88 } });
    expect(screen.getByTestId("cy-prow-pct")).toHaveTextContent("88%");
  });
  it("clamps progress above 100", () => {
    render(ProposalRow, { props: { ...base, progress: 250 } });
    expect(screen.getByTestId("cy-prow-pct")).toHaveTextContent("100%");
  });
  it("clamps progress below 0", () => {
    render(ProposalRow, { props: { ...base, progress: -10 } });
    expect(screen.getByTestId("cy-prow-pct")).toHaveTextContent("0%");
  });
  it("sets aria-valuenow", () => {
    render(ProposalRow, { props: { ...base, progress: 50 } });
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
  });
  it("formats vote counts with locale", () => {
    render(ProposalRow, { props: { ...base, votesFor: 8900, votesAgainst: 1200 } });
    expect(screen.getByLabelText("Votes in favor")).toHaveTextContent("8,900");
    expect(screen.getByLabelText("Votes against")).toHaveTextContent("1,200");
  });
  it("renders date when provided", () => {
    render(ProposalRow, { props: { ...base, date: "Jan 11, 2025" } });
    expect(screen.getByText("Jan 11, 2025")).toBeInTheDocument();
  });
  it("does not render date when missing", () => {
    const { container } = render(ProposalRow, { props: base });
    expect(container.querySelector(".cy-prow__date")).not.toBeInTheDocument();
  });
  it.each(["active", "passed", "rejected", "pending"] as const)("applies %s status class", (status) => {
    const { container } = render(ProposalRow, { props: { ...base, status } });
    expect(container.querySelector(`.cy-prow--${status}`)).toBeInTheDocument();
  });
  it("fires onClick with id", async () => {
    const onClick = vi.fn();
    render(ProposalRow, { props: { ...base, onClick } });
    await fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledWith(23);
  });
});
