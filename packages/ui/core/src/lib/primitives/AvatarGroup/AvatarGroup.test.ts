import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import AvatarGroup from "./AvatarGroup.svelte";

const avatars = [
  { initials: "AB" },
  { initials: "CD" },
  { initials: "EF" },
];

describe("AvatarGroup", () => {
  it("renders with default props", () => {
    const { container } = render(AvatarGroup);
    const group = container.querySelector("[role='group']");
    expect(group).toBeInTheDocument();
  });

  it("renders all avatars", () => {
    const { container } = render(AvatarGroup, { props: { avatars } });
    const items = container.querySelectorAll(".cy-avatar-group__item");
    expect(items).toHaveLength(3);
  });

  it("limits visible avatars to max prop", () => {
    const manyAvatars = Array.from({ length: 8 }, (_, i) => ({ initials: `U${i}` }));
    const { container } = render(AvatarGroup, { props: { avatars: manyAvatars, max: 3 } });
    const overflow = container.querySelector(".cy-avatar-group__overflow");
    expect(overflow).toBeInTheDocument();
  });

  it("has aria-label on the group", () => {
    const { container } = render(AvatarGroup);
    const group = container.querySelector("[role='group']");
    expect(group?.getAttribute("aria-label")).toBe("Avatar group");
  });
});
