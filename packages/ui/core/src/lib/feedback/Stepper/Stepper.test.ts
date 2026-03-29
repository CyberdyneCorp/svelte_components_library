import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Stepper from "./Stepper.svelte";

const steps = [
  { title: "Account", description: "Create account" },
  { title: "Profile", description: "Set up profile" },
  { title: "Done" },
];

describe("Stepper", () => {
  it("renders all step titles", () => {
    render(Stepper, { props: { steps } });
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("renders step numbers", () => {
    render(Stepper, { props: { steps, currentStep: 0 } });
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("has list role", () => {
    render(Stepper, { props: { steps } });
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("renders step descriptions", () => {
    render(Stepper, { props: { steps } });
    expect(screen.getByText("Create account")).toBeInTheDocument();
    expect(screen.getByText("Set up profile")).toBeInTheDocument();
  });

  it("disables upcoming steps", () => {
    render(Stepper, { props: { steps, currentStep: 0, completedSteps: [] } });
    const buttons = screen.getAllByRole("button");
    // Step 2 and 3 should be disabled (upcoming)
    expect(buttons[1]).toBeDisabled();
    expect(buttons[2]).toBeDisabled();
  });
});
