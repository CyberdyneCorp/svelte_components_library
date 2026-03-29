import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Carousel from "./Carousel.svelte";

const items = [
  { title: "Slide 1", content: "Content 1" },
  { title: "Slide 2", content: "Content 2" },
  { title: "Slide 3", content: "Content 3" },
];

describe("Carousel", () => {
  it("renders with carousel role", () => {
    render(Carousel, { props: { items } });
    expect(screen.getByRole("region")).toBeInTheDocument();
  });

  it("renders all slides", () => {
    render(Carousel, { props: { items } });
    expect(screen.getByText("Slide 1")).toBeInTheDocument();
    expect(screen.getByText("Slide 2")).toBeInTheDocument();
  });

  it("shows navigation arrows by default", () => {
    render(Carousel, { props: { items } });
    expect(screen.getByLabelText("Previous slide")).toBeInTheDocument();
    expect(screen.getByLabelText("Next slide")).toBeInTheDocument();
  });

  it("shows dot indicators", () => {
    render(Carousel, { props: { items } });
    const dots = screen.getAllByRole("tab");
    expect(dots.length).toBe(3);
  });

  it("navigates to next slide on arrow click", async () => {
    render(Carousel, { props: { items } });
    const nextBtn = screen.getByLabelText("Next slide");
    await fireEvent.click(nextBtn);
    const dots = screen.getAllByRole("tab");
    expect(dots[1]).toHaveAttribute("aria-selected", "true");
  });
});
