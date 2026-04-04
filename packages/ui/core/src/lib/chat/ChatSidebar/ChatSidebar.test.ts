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

  it("calls oncreatefolder on Enter key in folder input", async () => {
    const oncreatefolder = vi.fn();
    const { container } = render(ChatSidebar, {
      props: { conversations: [], folders: [], oncreatefolder },
    });
    await fireEvent.click(screen.getByTitle("Create folder"));
    const input = container.querySelector(".cy-chat-sidebar__input") as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "Work" } });
    await fireEvent.keyDown(input, { key: "Enter" });
    expect(oncreatefolder).toHaveBeenCalledWith("Work");
  });

  it("hides folder input on Escape key", async () => {
    const { container } = render(ChatSidebar, {
      props: { conversations: [], folders: [] },
    });
    await fireEvent.click(screen.getByTitle("Create folder"));
    const input = container.querySelector(".cy-chat-sidebar__input") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    await fireEvent.keyDown(input, { key: "Escape" });
    const inputAfter = container.querySelector(".cy-chat-sidebar__input");
    expect(inputAfter).not.toBeInTheDocument();
  });

  it("does not call oncreatefolder with empty name", async () => {
    const oncreatefolder = vi.fn();
    const { container } = render(ChatSidebar, {
      props: { conversations: [], folders: [], oncreatefolder },
    });
    await fireEvent.click(screen.getByTitle("Create folder"));
    const okBtn = screen.getByText("OK");
    await fireEvent.click(okBtn);
    expect(oncreatefolder).not.toHaveBeenCalled();
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

  it("calls ondelete when conversation delete button is clicked", async () => {
    const ondelete = vi.fn();
    render(ChatSidebar, {
      props: {
        conversations: [{ id: "c1", title: "Test", messageCount: 1 }],
        folders: [],
        ondelete,
      },
    });
    const deleteBtn = screen.getByTestId("delete-c1");
    await fireEvent.click(deleteBtn);
    expect(ondelete).toHaveBeenCalledWith("c1");
  });

  it("shows move-to-folder select when folders exist for unfoldered conversations", () => {
    const { container } = render(ChatSidebar, {
      props: {
        conversations: [{ id: "c1", title: "Test", messageCount: 1 }],
        folders: mockFolders,
      },
    });
    const select = container.querySelector(".cy-chat-sidebar__move-select");
    expect(select).toBeInTheDocument();
  });

  it("calls onmove when a folder is selected in move dropdown", async () => {
    const onmove = vi.fn();
    const { container } = render(ChatSidebar, {
      props: {
        conversations: [{ id: "c1", title: "Test", messageCount: 1 }],
        folders: mockFolders,
        onmove,
      },
    });
    const select = container.querySelector(".cy-chat-sidebar__move-select") as HTMLSelectElement;
    await fireEvent.change(select, { target: { value: "f1" } });
    expect(onmove).toHaveBeenCalledWith("c1", "f1");
  });

  it("does not show move select when no folders exist", () => {
    const { container } = render(ChatSidebar, {
      props: {
        conversations: [{ id: "c1", title: "Test", messageCount: 1 }],
        folders: [],
      },
    });
    const select = container.querySelector(".cy-chat-sidebar__move-select");
    expect(select).not.toBeInTheDocument();
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

  it("displays folder conversation count", () => {
    render(ChatSidebar, {
      props: { conversations: mockConversations, folders: mockFolders },
    });
    // folder "Work" has 1 conversation (c2)
    const folderEl = screen.getByTestId("folder-f1");
    expect(folderEl.textContent).toContain("1");
  });
});
