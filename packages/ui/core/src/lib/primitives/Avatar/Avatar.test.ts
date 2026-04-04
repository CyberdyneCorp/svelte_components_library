import { render, fireEvent } from "@testing-library/svelte";
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

  it("falls back to initials on image error", async () => {
    const { container } = render(Avatar, { props: { src: "https://broken.url/img.png", initials: "JD" } });
    const img = container.querySelector("img")!;
    await fireEvent.error(img);
    // After error, image should be replaced by initials
    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.querySelector(".cy-avatar__initials")?.textContent).toBe("JD");
  });

  it("does not render status indicator when no status", () => {
    const { container } = render(Avatar, { props: { initials: "AB" } });
    expect(container.querySelector(".cy-avatar__status")).not.toBeInTheDocument();
  });

  it("applies sm size class", () => {
    const { container } = render(Avatar, { props: { size: "sm" } });
    expect(container.querySelector(".cy-avatar")?.className).toContain("sm");
  });

  it("applies xl size class", () => {
    const { container } = render(Avatar, { props: { size: "xl" } });
    expect(container.querySelector(".cy-avatar")?.className).toContain("xl");
  });

  it("renders offline status class", () => {
    const { container } = render(Avatar, { props: { initials: "AB", status: "offline" } });
    expect(container.querySelector(".cy-avatar__status--offline")).toBeInTheDocument();
  });

  it("renders busy status class", () => {
    const { container } = render(Avatar, { props: { initials: "AB", status: "busy" } });
    expect(container.querySelector(".cy-avatar__status--busy")).toBeInTheDocument();
  });

  it("status has aria-label", () => {
    const { container } = render(Avatar, { props: { initials: "AB", status: "online" } });
    const status = container.querySelector(".cy-avatar__status");
    expect(status?.getAttribute("aria-label")).toBe("online");
  });

  it("shows initials when src is undefined", () => {
    const { container } = render(Avatar, { props: { initials: "XY" } });
    expect(container.querySelector(".cy-avatar__initials")?.textContent).toBe("XY");
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("shows empty initials when neither src nor initials", () => {
    const { container } = render(Avatar);
    expect(container.querySelector(".cy-avatar__initials")).toBeInTheDocument();
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });
});
