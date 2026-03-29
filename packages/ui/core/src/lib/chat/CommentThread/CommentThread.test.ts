import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import CommentThread from "./CommentThread.svelte";

describe("CommentThread", () => {
  const comments = [
    {
      id: "1",
      author: "Alice",
      content: "Great post!",
      timestamp: new Date().toISOString(),
      replies: [],
    },
  ];

  it("renders empty state when no comments", () => {
    render(CommentThread, { props: { comments: [] } });
    expect(screen.getByText("No comments yet.")).toBeInTheDocument();
  });

  it("displays comment content", () => {
    render(CommentThread, { props: { comments } });
    expect(screen.getByText("Great post!")).toBeInTheDocument();
  });

  it("displays author name", () => {
    render(CommentThread, { props: { comments } });
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("shows reply button", () => {
    render(CommentThread, { props: { comments } });
    expect(screen.getByText("Reply")).toBeInTheDocument();
  });

  it("shows reply input when reply is clicked", async () => {
    render(CommentThread, { props: { comments } });
    await fireEvent.click(screen.getByText("Reply"));
    expect(screen.getByPlaceholderText("Write a reply...")).toBeInTheDocument();
  });
});
