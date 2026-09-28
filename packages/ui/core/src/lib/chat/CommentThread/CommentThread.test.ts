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

  it("submits a reply and calls onreply", async () => {
    const onreply = vi.fn();
    render(CommentThread, { props: { comments, onreply } });
    await fireEvent.click(screen.getByText("Reply"));
    const textarea = screen.getByPlaceholderText("Write a reply...");
    await fireEvent.input(textarea, { target: { value: "Nice!" } });
    await fireEvent.click(screen.getByText("Submit"));
    expect(onreply).toHaveBeenCalledWith("1", "Nice!");
  });

  it("does not submit empty reply", async () => {
    const onreply = vi.fn();
    render(CommentThread, { props: { comments, onreply } });
    await fireEvent.click(screen.getByText("Reply"));
    const submitBtn = screen.getByText("Submit");
    expect(submitBtn).toBeDisabled();
  });

  it("cancels reply and hides input", async () => {
    render(CommentThread, { props: { comments } });
    await fireEvent.click(screen.getByText("Reply"));
    expect(screen.getByPlaceholderText("Write a reply...")).toBeInTheDocument();
    await fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByPlaceholderText("Write a reply...")).not.toBeInTheDocument();
  });

  it("displays relative timestamps", () => {
    const recentComments = [
      {
        id: "1",
        author: "Alice",
        content: "Hello",
        timestamp: new Date().toISOString(),
      },
    ];
    render(CommentThread, { props: { comments: recentComments } });
    expect(screen.getByText("just now")).toBeInTheDocument();
  });

  it("displays minutes ago for recent timestamps", () => {
    const minutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const recentComments = [
      { id: "1", author: "Alice", content: "Hello", timestamp: minutesAgo },
    ];
    render(CommentThread, { props: { comments: recentComments } });
    expect(screen.getByText("5 min ago")).toBeInTheDocument();
  });

  it("displays hours ago for older timestamps", () => {
    const hoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    const recentComments = [
      { id: "1", author: "Alice", content: "Hello", timestamp: hoursAgo },
    ];
    render(CommentThread, { props: { comments: recentComments } });
    expect(screen.getByText("3 hours ago")).toBeInTheDocument();
  });

  it("displays days ago for day-old timestamps", () => {
    const daysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const recentComments = [
      { id: "1", author: "Alice", content: "Hello", timestamp: daysAgo },
    ];
    render(CommentThread, { props: { comments: recentComments } });
    expect(screen.getByText("2 days ago")).toBeInTheDocument();
  });

  it("displays singular hour ago", () => {
    const hourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
    const recentComments = [
      { id: "1", author: "Alice", content: "Hello", timestamp: hourAgo },
    ];
    render(CommentThread, { props: { comments: recentComments } });
    expect(screen.getByText("1 hour ago")).toBeInTheDocument();
  });

  it("displays singular day ago", () => {
    const dayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
    const recentComments = [
      { id: "1", author: "Alice", content: "Hello", timestamp: dayAgo },
    ];
    render(CommentThread, { props: { comments: recentComments } });
    expect(screen.getByText("1 day ago")).toBeInTheDocument();
  });

  it("displays date for old timestamps (>30 days)", () => {
    const oldDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const oldComments = [
      { id: "1", author: "Alice", content: "Hello", timestamp: oldDate },
    ];
    render(CommentThread, { props: { comments: oldComments } });
    // Should show a formatted date (e.g., "2/3/2026"), not "x days ago"
    expect(screen.queryByText(/ago/)).not.toBeInTheDocument();
  });

  it("shows initials when no avatar is provided", () => {
    render(CommentThread, { props: { comments } });
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("shows avatar image when provided", () => {
    const withAvatar = [
      {
        id: "1",
        author: "Alice",
        avatar: "https://example.com/alice.png",
        content: "Hi",
        timestamp: new Date().toISOString(),
      },
    ];
    const { container } = render(CommentThread, { props: { comments: withAvatar } });
    const img = container.querySelector(".cy-comment-thread__avatar-img") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("alice.png");
  });

  it("displays reactions when present", () => {
    const withReactions = [
      {
        id: "1",
        author: "Alice",
        content: "Cool!",
        timestamp: new Date().toISOString(),
        reactions: [{ emoji: "👍", count: 3 }],
      },
    ];
    render(CommentThread, { props: { comments: withReactions } });
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("calls onreact when reaction pill is clicked", async () => {
    const onreact = vi.fn();
    const withReactions = [
      {
        id: "1",
        author: "Alice",
        content: "Cool!",
        timestamp: new Date().toISOString(),
        reactions: [{ emoji: "👍", count: 3 }],
      },
    ];
    render(CommentThread, { props: { comments: withReactions, onreact } });
    const reactionBtn = screen.getByText("3").closest("button")!;
    await fireEvent.click(reactionBtn);
    expect(onreact).toHaveBeenCalledWith("1", "👍");
  });

  it("calls onreact with thumbs up when React button is clicked", async () => {
    const onreact = vi.fn();
    render(CommentThread, { props: { comments, onreact } });
    await fireEvent.click(screen.getByText("React"));
    expect(onreact).toHaveBeenCalledWith("1", "👍");
  });

  it("renders nested replies", () => {
    const nested = [
      {
        id: "1",
        author: "Alice",
        content: "Root",
        timestamp: new Date().toISOString(),
        replies: [
          {
            id: "2",
            author: "Bob",
            content: "Reply!",
            timestamp: new Date().toISOString(),
          },
        ],
      },
    ];
    render(CommentThread, { props: { comments: nested } });
    expect(screen.getByText("Reply!")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("marks depths 1-3 with accents 1-3 and depth 4+ with accent 4", () => {
    type Node = {
      id: string;
      author: string;
      content: string;
      timestamp: string;
      replies?: Node[];
    };
    const chain = (level: number): Node => ({
      id: String(level),
      author: `U${level}`,
      content: `L${level}`,
      timestamp: new Date().toISOString(),
      replies: level < 5 ? [chain(level + 1)] : [],
    });
    render(CommentThread, { props: { comments: [chain(0)], maxDepth: 6 } });
    const accentAt = (level: number) =>
      screen.getByText(`L${level}`).closest(".cy-comment-thread__comment")?.getAttribute("style");
    expect(accentAt(0) ?? "").toBe("");
    expect(accentAt(1)).toContain("var(--color-accent-1)");
    expect(accentAt(2)).toContain("var(--color-accent-2)");
    expect(accentAt(3)).toContain("var(--color-accent-3)");
    expect(accentAt(4)).toContain("var(--color-accent-4)");
    expect(accentAt(5)).toContain("var(--color-accent-4)");
  });

  it("shows 'View more replies' when depth exceeds maxDepth", () => {
    const deep = [
      {
        id: "1",
        author: "A",
        content: "L0",
        timestamp: new Date().toISOString(),
        replies: [
          {
            id: "2",
            author: "B",
            content: "L1",
            timestamp: new Date().toISOString(),
            replies: [
              {
                id: "3",
                author: "C",
                content: "L2",
                timestamp: new Date().toISOString(),
                replies: [
                  {
                    id: "4",
                    author: "D",
                    content: "L3",
                    timestamp: new Date().toISOString(),
                    replies: [
                      {
                        id: "5",
                        author: "E",
                        content: "L4",
                        timestamp: new Date().toISOString(),
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];
    render(CommentThread, { props: { comments: deep, maxDepth: 3 } });
    expect(screen.getByText(/View more replies/)).toBeInTheDocument();
  });

  it("displays initials for multi-word names", () => {
    const multiWord = [
      {
        id: "1",
        author: "John Doe",
        content: "Hi",
        timestamp: new Date().toISOString(),
      },
    ];
    render(CommentThread, { props: { comments: multiWord } });
    expect(screen.getByText("JD")).toBeInTheDocument();
  });
});
