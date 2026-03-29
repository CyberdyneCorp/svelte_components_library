import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Calendar from "./Calendar.svelte";

describe("Calendar", () => {
  it("renders month and year header", () => {
    render(Calendar, { props: { month: 0, year: 2025 } });
    expect(screen.getByText("January 2025")).toBeInTheDocument();
  });

  it("renders day labels", () => {
    render(Calendar, { props: { month: 0, year: 2025 } });
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Sun")).toBeInTheDocument();
  });

  it("renders navigation buttons", () => {
    render(Calendar, { props: { month: 0, year: 2025 } });
    expect(screen.getByLabelText("Previous month")).toBeInTheDocument();
    expect(screen.getByLabelText("Next month")).toBeInTheDocument();
  });

  it("navigates to next month", async () => {
    render(Calendar, { props: { month: 0, year: 2025 } });
    await fireEvent.click(screen.getByLabelText("Next month"));
    expect(screen.getByText("February 2025")).toBeInTheDocument();
  });

  it("navigates to previous month", async () => {
    render(Calendar, { props: { month: 0, year: 2025 } });
    await fireEvent.click(screen.getByLabelText("Previous month"));
    expect(screen.getByText("December 2024")).toBeInTheDocument();
  });
});
