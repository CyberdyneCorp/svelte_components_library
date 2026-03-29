import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import StepProgress from "./StepProgress.svelte";

describe("StepProgress", () => {
  const steps = [
    { label: "Data Loading" },
    { label: "Preprocessing" },
    { label: "Training", description: "Fine-tuning model" },
  ];

  it("renders with default props", () => {
    render(StepProgress);
    const el = document.querySelector(".cy-steps");
    expect(el).toBeInTheDocument();
  });

  it("renders all step labels", () => {
    render(StepProgress, { props: { steps } });
    expect(screen.getByText("Data Loading")).toBeInTheDocument();
    expect(screen.getByText("Preprocessing")).toBeInTheDocument();
    expect(screen.getByText("Training")).toBeInTheDocument();
  });

  it("shows step description when provided", () => {
    render(StepProgress, { props: { steps } });
    expect(screen.getByText("Fine-tuning model")).toBeInTheDocument();
  });

  it("marks completed steps", () => {
    render(StepProgress, { props: { steps, currentStep: 2 } });
    const items = document.querySelectorAll(".cy-steps__item--completed");
    expect(items.length).toBe(2);
  });

  it("applies horizontal variant by default", () => {
    render(StepProgress, { props: { steps } });
    const el = document.querySelector(".cy-steps--horizontal");
    expect(el).toBeInTheDocument();
  });
});
