import { render, screen } from "@testing-library/svelte";
import { describe, it, expect, vi, beforeAll } from "vitest";
import InfiniteScrollTest from "./InfiniteScrollTest.svelte";

beforeAll(() => {
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

describe("InfiniteScroll", () => {
  it("renders the container", () => {
    const { container } = render(InfiniteScrollTest, {
      props: { loading: false, hasMore: true },
    });
    expect(container.querySelector(".cy-infinite-scroll")).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(InfiniteScrollTest, { props: { loading: false, hasMore: true } });
    expect(screen.getByTestId("scroll-content")).toBeInTheDocument();
  });

  it("shows loading indicator when loading", () => {
    render(InfiniteScrollTest, { props: { loading: true, hasMore: true } });
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows custom loading text", () => {
    render(InfiniteScrollTest, {
      props: { loading: true, hasMore: true, loadingText: "Fetching..." },
    });
    expect(screen.getByText("Fetching...")).toBeInTheDocument();
  });

  it("shows end message when no more items", () => {
    render(InfiniteScrollTest, { props: { loading: false, hasMore: false } });
    expect(screen.getByText("No more items")).toBeInTheDocument();
  });
});
