import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Avatar from "./Avatar.svelte";

describe("Avatar", () => {
  it("renders with default props", () => {
    const { container } = render(Avatar);
    const avatar = container.querySelector(".cy-avatar");
    expect(avatar).toBeInTheDocument();
  });

  it("displays initials when no src provided", () => {
    const { container } = render(Avatar, { props: { initials: "JD" } });
    const initials = container.querySelector(".cy-avatar__initials");
    expect(initials?.textContent).toBe("JD");
  });

  it("renders image when src is provided", () => {
    const { container } = render(Avatar, { props: { src: "https://example.com/img.png", alt: "User" } });
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute("alt")).toBe("User");
  });

  it("applies size class", () => {
    const { container } = render(Avatar, { props: { size: "lg" } });
    const avatar = container.querySelector(".cy-avatar");
    expect(avatar?.className).toContain("lg");
  });

  it("renders status indicator when status is provided", () => {
    const { container } = render(Avatar, { props: { initials: "AB", status: "online" } });
    const status = container.querySelector(".cy-avatar__status");
    expect(status).toBeInTheDocument();
  });
});
