import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import ChatSidebar from "./ChatSidebar.svelte";

const mockConversations = [
  { id: "c1", title: "First chat", messageCount: 5 },
  { id: "c2", title: "Second chat", messageCount: 3, folderId: "f1" },
  { id: "c3", title: "Third chat", messageCount: 8 },
];

const mockFolders = [{ id: "f1", name: "Work" }];

describe("ChatSidebar", () => {
  it("renders conversations", () => {
    render(ChatSidebar, {
      props: { conversations: mockConversations, folders: [] },
    });
    expect(screen.getByText("First chat")).toBeInTheDocument();
    expect(screen.getByText("Third chat")).toBeInTheDocument();
  });

  it("renders folders with grouped conversations", () => {
    const { container } = render(ChatSidebar, {
      props: { conversations: mockConversations, folders: mockFolders },
    });
    expect(screen.getByTestId("folder-f1")).toBeInTheDocument();
    expect(screen.getByText("Second chat")).toBeInTheDocument();
    const folder = container.querySelector('[data-testid="folder-f1"]');
    expect(folder).toBeInTheDocument();
  });

  it("shows delete button on conversation hover", async () => {
    const ondelete = vi.fn();
    const { container } = render(ChatSidebar, {
      props: {
        conversations: [{ id: "c1", title: "Test", messageCount: 1 }],
        folders: [],
        ondelete,
      },
    });
    const deleteBtn = container.querySelector('[data-testid="delete-c1"]');
    expect(deleteBtn).toBeInTheDocument();
  });

  it("handles empty state", () => {
    render(ChatSidebar, {
      props: { conversations: [], folders: [] },
    });
    expect(screen.getByText("No conversations yet")).toBeInTheDocument();
  });

  it("applies selected class to selected conversation", () => {
    const { container } = render(ChatSidebar, {
      props: {
        conversations: [{ id: "c1", title: "Selected", messageCount: 2 }],
        folders: [],
        selectedId: "c1",
      },
    });
    const selected = container.querySelector(
      ".cy-chat-sidebar__item--selected"
    );
    expect(selected).toBeInTheDocument();
  });

  it("calls oncreate when new chat button is clicked", async () => {
    const oncreate = vi.fn();
    render(ChatSidebar, {
      props: { conversations: [], folders: [], oncreate },
    });
    const btn = screen.getByTestId("new-chat-btn");
    await fireEvent.click(btn);
    expect(oncreate).toHaveBeenCalledOnce();
  });

  it("calls onselect when conversation is clicked", async () => {
    const onselect = vi.fn();
    const { container } = render(ChatSidebar, {
      props: {
        conversations: [{ id: "c1", title: "Test", messageCount: 1 }],
        folders: [],
        onselect,
      },
    });
    const item = container.querySelector(
      '[data-testid="conversation-c1"]'
    ) as HTMLElement;
    await fireEvent.click(item);
    expect(onselect).toHaveBeenCalledWith("c1");
  });
});
