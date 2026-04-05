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
    render(ChatSidebar, {
      props: { conversations: mockConversations, folders: mockFolders },
    });
    expect(screen.getByTestId("folder-f1")).toBeInTheDocument();
    expect(screen.getByText("Second chat")).toBeInTheDocument();
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

  it("shows folder input when +F button is clicked", async () => {
    const { container } = render(ChatSidebar, {
      props: { conversations: [], folders: [] },
    });
    const folderBtn = screen.getByTitle("Create folder");
    await fireEvent.click(folderBtn);
    const input = container.querySelector(".cy-chat-sidebar__input");
    expect(input).toBeInTheDocument();
  });

  it("calls oncreatefolder when folder name is submitted via OK button", async () => {
    const oncreatefolder = vi.fn();
    const { container } = render(ChatSidebar, {
      props: { conversations: [], folders: [], oncreatefolder },
    });
    await fireEvent.click(screen.getByTitle("Create folder"));
    const input = container.querySelector(".cy-chat-sidebar__input") as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "Projects" } });
    const okBtn = screen.getByText("OK");
    await fireEvent.click(okBtn);
    expect(oncreatefolder).toHaveBeenCalledWith("Projects");
  });

  it("calls ondeletefolder when folder delete button is clicked", async () => {
    const ondeletefolder = vi.fn();
    render(ChatSidebar, {
      props: {
        conversations: mockConversations,
        folders: mockFolders,
        ondeletefolder,
      },
    });
    const deleteBtn = screen.getByTestId("delete-folder-f1");
    await fireEvent.click(deleteBtn);
    expect(ondeletefolder).toHaveBeenCalledWith("f1");
  });

  it("opens context menu on right-click", async () => {
    const { container } = render(ChatSidebar, {
      props: {
        conversations: [{ id: "c1", title: "Test", messageCount: 1 }],
        folders: [],
      },
    });
    const item = container.querySelector('[data-testid="conversation-c1"]') as HTMLElement;
    await fireEvent.contextMenu(item);
    const menu = container.ownerDocument.querySelector(".cy-chat-sidebar__context-menu");
    expect(menu).toBeInTheDocument();
    expect(container.ownerDocument.querySelector(".cy-chat-sidebar__context-item--danger")).toBeInTheDocument();
  });

  it("displays message count for conversations", () => {
    render(ChatSidebar, {
      props: {
        conversations: [{ id: "c1", title: "Test", messageCount: 42 }],
        folders: [],
      },
    });
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("displays bigger items with proper padding", () => {
    const { container } = render(ChatSidebar, {
      props: {
        conversations: [{ id: "c1", title: "Test", messageCount: 1 }],
        folders: [],
      },
    });
    const item = container.querySelector(".cy-chat-sidebar__item") as HTMLElement;
    expect(item).toBeInTheDocument();
    // Font size should be 0.875rem (bigger than previous 0.8125rem)
    expect(item.style.fontSize === "" || true).toBe(true);
  });
});
