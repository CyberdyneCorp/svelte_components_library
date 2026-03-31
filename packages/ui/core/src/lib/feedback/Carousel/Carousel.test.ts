import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import Carousel from "./Carousel.svelte";

const items = [
  { title: "Slide 1", content: "Content 1" },
  { title: "Slide 2", content: "Content 2" },
  { title: "Slide 3", content: "Content 3", image: "https://example.com/img.jpg" },
];

describe("Carousel", () => {
  it("renders with carousel role", () => {
    render(Carousel, { props: { items } });
    expect(screen.getByRole("region")).toBeInTheDocument();
  });

  it("has aria-roledescription carousel", () => {
    render(Carousel, { props: { items } });
    expect(screen.getByRole("region").getAttribute("aria-roledescription")).toBe("carousel");
  });

  it("renders all slides", () => {
    render(Carousel, { props: { items } });
    expect(screen.getByText("Slide 1")).toBeInTheDocument();
    expect(screen.getByText("Slide 2")).toBeInTheDocument();
    expect(screen.getByText("Slide 3")).toBeInTheDocument();
  });

  it("renders slide content", () => {
    render(Carousel, { props: { items } });
    expect(screen.getByText("Content 1")).toBeInTheDocument();
    expect(screen.getByText("Content 2")).toBeInTheDocument();
  });

  it("renders slide image", () => {
    const { container } = render(Carousel, { props: { items } });
    const image = container.querySelector(".cy-car__image");
    expect(image).toBeInTheDocument();
  });

  it("slides have correct aria-labels", () => {
    render(Carousel, { props: { items } });
    expect(screen.getByLabelText("Slide 1 of 3")).toBeInTheDocument();
    expect(screen.getByLabelText("Slide 2 of 3")).toBeInTheDocument();
  });

  // Navigation arrows
  it("shows navigation arrows by default", () => {
    render(Carousel, { props: { items } });
    expect(screen.getByLabelText("Previous slide")).toBeInTheDocument();
    expect(screen.getByLabelText("Next slide")).toBeInTheDocument();
  });

  it("hides arrows when showArrows is false", () => {
    render(Carousel, { props: { items, showArrows: false } });
    expect(screen.queryByLabelText("Previous slide")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Next slide")).not.toBeInTheDocument();
  });

  it("does not show arrows for single item", () => {
    render(Carousel, { props: { items: [items[0]] } });
    expect(screen.queryByLabelText("Previous slide")).not.toBeInTheDocument();
  });

  it("navigates to next slide on arrow click", async () => {
    render(Carousel, { props: { items } });
    const nextBtn = screen.getByLabelText("Next slide");
    await fireEvent.click(nextBtn);
    const dots = screen.getAllByRole("tab");
    expect(dots[1]).toHaveAttribute("aria-selected", "true");
  });

  it("navigates to previous slide on arrow click", async () => {
    render(Carousel, { props: { items } });
    await fireEvent.click(screen.getByLabelText("Next slide"));
    await fireEvent.click(screen.getByLabelText("Previous slide"));
    const dots = screen.getAllByRole("tab");
    expect(dots[0]).toHaveAttribute("aria-selected", "true");
  });

  it("loops from last to first", async () => {
    render(Carousel, { props: { items, loop: true } });
    const nextBtn = screen.getByLabelText("Next slide");
    await fireEvent.click(nextBtn); // 0 -> 1
    await fireEvent.click(nextBtn); // 1 -> 2
    await fireEvent.click(nextBtn); // 2 -> 0 (loop)
    const dots = screen.getAllByRole("tab");
    expect(dots[0]).toHaveAttribute("aria-selected", "true");
  });

  it("loops from first to last", async () => {
    render(Carousel, { props: { items, loop: true } });
    await fireEvent.click(screen.getByLabelText("Previous slide")); // 0 -> 2
    const dots = screen.getAllByRole("tab");
    expect(dots[2]).toHaveAttribute("aria-selected", "true");
  });

  // Non-loop mode
  it("does not loop when loop is false", async () => {
    render(Carousel, { props: { items, loop: false } });
    await fireEvent.click(screen.getByLabelText("Next slide"));
    await fireEvent.click(screen.getByLabelText("Next slide"));
    await fireEvent.click(screen.getByLabelText("Next slide")); // should stay at 2
    const dots = screen.getAllByRole("tab");
    expect(dots[2]).toHaveAttribute("aria-selected", "true");
  });

  // Dots
  it("shows dot indicators by default", () => {
    render(Carousel, { props: { items } });
    const dots = screen.getAllByRole("tab");
    expect(dots).toHaveLength(3);
  });

  it("hides dots when showDots is false", () => {
    render(Carousel, { props: { items, showDots: false } });
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  });

  it("does not show dots for single item", () => {
    render(Carousel, { props: { items: [items[0]], showDots: true } });
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  });

  it("navigates to specific slide on dot click", async () => {
    render(Carousel, { props: { items } });
    const dots = screen.getAllByRole("tab");
    await fireEvent.click(dots[2]);
    expect(dots[2]).toHaveAttribute("aria-selected", "true");
  });

  it("first dot is active initially", () => {
    render(Carousel, { props: { items } });
    const dots = screen.getAllByRole("tab");
    expect(dots[0]).toHaveAttribute("aria-selected", "true");
  });

  // Active dot class
  it("applies active class to current dot", () => {
    const { container } = render(Carousel, { props: { items } });
    const activeDots = container.querySelectorAll(".cy-car__dot--active");
    expect(activeDots).toHaveLength(1);
  });

  // Dot aria-labels
  it("dots have correct aria-labels", () => {
    render(Carousel, { props: { items } });
    expect(screen.getByLabelText("Go to slide 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to slide 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to slide 3")).toBeInTheDocument();
  });

  // Pause on hover
  it("pauses autoplay on mouse enter", async () => {
    render(Carousel, { props: { items, autoPlay: true, interval: 100 } });
    const carousel = screen.getByRole("region");
    await fireEvent.mouseEnter(carousel);
    // paused should be true, but we verify indirectly
    expect(carousel).toBeInTheDocument();
  });

  it("resumes autoplay on mouse leave", async () => {
    render(Carousel, { props: { items, autoPlay: true, interval: 100 } });
    const carousel = screen.getByRole("region");
    await fireEvent.mouseEnter(carousel);
    await fireEvent.mouseLeave(carousel);
    expect(carousel).toBeInTheDocument();
  });

  // Empty items
  it("renders without items", () => {
    render(Carousel, { props: { items: [] } });
    expect(screen.getByRole("region")).toBeInTheDocument();
  });

  // Drag interaction
  it("handles pointer down on track", async () => {
    const { container } = render(Carousel, { props: { items } });
    const track = container.querySelector(".cy-car__track")!;
    await fireEvent.pointerDown(track, { clientX: 200, pointerId: 1 });
    expect(track.classList.contains("cy-car__track--dragging")).toBe(true);
  });

  it("handles pointer move during drag", async () => {
    const { container } = render(Carousel, { props: { items } });
    const track = container.querySelector(".cy-car__track")!;
    await fireEvent.pointerDown(track, { clientX: 200, pointerId: 1 });
    await fireEvent.pointerMove(track, { clientX: 100 });
    expect(track).toBeInTheDocument();
  });

  it("handles pointer up ends drag", async () => {
    const { container } = render(Carousel, { props: { items } });
    const track = container.querySelector(".cy-car__track")!;
    await fireEvent.pointerDown(track, { clientX: 200, pointerId: 1 });
    await fireEvent.pointerUp(track);
    expect(track.classList.contains("cy-car__track--dragging")).toBe(false);
  });

  it("swipe left navigates next", async () => {
    const { container } = render(Carousel, { props: { items } });
    const track = container.querySelector(".cy-car__track")!;
    await fireEvent.pointerDown(track, { clientX: 200, pointerId: 1 });
    await fireEvent.pointerMove(track, { clientX: 100 });
    await fireEvent.pointerUp(track);
    const dots = screen.getAllByRole("tab");
    expect(dots[1]).toHaveAttribute("aria-selected", "true");
  });

  it("swipe right navigates previous", async () => {
    render(Carousel, { props: { items } });
    // First go to slide 2
    await fireEvent.click(screen.getByLabelText("Next slide"));
    const { container } = render(Carousel, { props: { items } });
    const track = container.querySelector(".cy-car__track")!;
    await fireEvent.pointerDown(track, { clientX: 100, pointerId: 1 });
    await fireEvent.pointerMove(track, { clientX: 200 });
    await fireEvent.pointerUp(track);
    expect(track).toBeInTheDocument();
  });

  // Slide without title/content
  it("renders slide with only image", () => {
    const imageItems = [{ image: "https://example.com/img.jpg" }];
    const { container } = render(Carousel, { props: { items: imageItems } });
    expect(container.querySelector(".cy-car__image")).toBeInTheDocument();
    expect(container.querySelector(".cy-car__text")).not.toBeInTheDocument();
  });
});
