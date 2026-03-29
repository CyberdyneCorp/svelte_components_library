import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import VideoPlayer from "./VideoPlayer.svelte";

describe("VideoPlayer", () => {
  it("renders the video player region", () => {
    render(VideoPlayer, { props: { src: "test.mp4" } });
    expect(screen.getByLabelText("Video player")).toBeInTheDocument();
  });

  it("renders a video element", () => {
    const { container } = render(VideoPlayer, { props: { src: "test.mp4" } });
    const video = container.querySelector("video");
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute("src", "test.mp4");
  });

  it("shows play overlay when not playing", () => {
    render(VideoPlayer, { props: { src: "test.mp4" } });
    expect(screen.getByLabelText("Play video")).toBeInTheDocument();
  });

  it("renders controls when showControls is true", () => {
    const { container } = render(VideoPlayer, {
      props: { src: "test.mp4", showControls: true },
    });
    expect(container.querySelector(".cy-video__controls")).toBeInTheDocument();
  });

  it("applies poster attribute to video", () => {
    const { container } = render(VideoPlayer, {
      props: { src: "test.mp4", poster: "poster.jpg" },
    });
    const video = container.querySelector("video");
    expect(video).toHaveAttribute("poster", "poster.jpg");
  });
});
