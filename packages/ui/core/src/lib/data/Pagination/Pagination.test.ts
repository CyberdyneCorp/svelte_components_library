import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import Pagination from "./Pagination.svelte";

describe("Pagination", () => {
  it("renders pagination nav", () => {
    render(Pagination, { props: { currentPage: 1, totalPages: 5 } });
    expect(screen.getByLabelText("Pagination")).toBeInTheDocument();
  });

  it("marks current page as active", () => {
    render(Pagination, { props: { currentPage: 3, totalPages: 5 } });
    const page3 = screen.getByLabelText("Page 3");
    expect(page3).toHaveAttribute("aria-current", "page");
  });

  it("disables previous button on first page", () => {
    render(Pagination, { props: { currentPage: 1, totalPages: 5 } });
    expect(screen.getByLabelText("Previous page")).toBeDisabled();
  });

  it("disables next button on last page", () => {
    render(Pagination, { props: { currentPage: 5, totalPages: 5 } });
    expect(screen.getByLabelText("Next page")).toBeDisabled();
  });

  it("calls onchange when a page button is clicked", async () => {
    const onchange = vi.fn();
    render(Pagination, { props: { currentPage: 1, totalPages: 5, onchange } });
    await fireEvent.click(screen.getByLabelText("Page 3"));
    expect(onchange).toHaveBeenCalledWith(3);
  });
});
