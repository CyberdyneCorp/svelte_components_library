<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ChatSidebar from "./ChatSidebar.svelte";

  const { Story } = defineMeta({
    title: "Chat/ChatSidebar",
    component: ChatSidebar,
    tags: ["autodocs"],
  });

  const conversations = [
    { id: "c1", title: "Deploying to production", messageCount: 12 },
    { id: "c2", title: "Debugging auth flow", messageCount: 5, folderId: "f1" },
    { id: "c3", title: "API design review", messageCount: 23 },
    { id: "c4", title: "Database migration plan", messageCount: 8, folderId: "f1" },
    { id: "c5", title: "CI/CD pipeline setup", messageCount: 3 },
  ];

  const folders = [
    { id: "f1", name: "Work" },
    { id: "f2", name: "Research" },
  ];
</script>

<Story name="Default" args={{ conversations, folders, selectedId: "c1" }}>
  <div style="height: 500px; display: flex;">
    <ChatSidebar {conversations} {folders} selectedId="c1" />
  </div>
</Story>

<Story name="Empty">
  <div style="height: 400px; display: flex;">
    <ChatSidebar conversations={[]} folders={[]} />
  </div>
</Story>

<Story name="No Folders">
  <div style="height: 400px; display: flex;">
    <ChatSidebar
      conversations={[
        { id: "c1", title: "Quick question", messageCount: 2 },
        { id: "c2", title: "Long discussion", messageCount: 45 },
        { id: "c3", title: "Code review notes", messageCount: 7 },
      ]}
      folders={[]}
      selectedId="c2"
    />
  </div>
</Story>
