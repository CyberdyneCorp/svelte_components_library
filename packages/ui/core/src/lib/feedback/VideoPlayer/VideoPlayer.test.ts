import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { tick } from "svelte";
import VideoPlayer from "./VideoPlayer.svelte";

describe("VideoPlayer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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

  it("does not render controls when showControls is false", () => {
    const { container } = render(VideoPlayer, {
      props: { src: "test.mp4", showControls: false },
    });
    expect(container.querySelector(".cy-video__controls")).not.toBeInTheDocument();
  });

  it("applies loop attribute to video", () => {
    const { container } = render(VideoPlayer, {
      props: { src: "test.mp4", loop: true },
    });
    const video = container.querySelector("video");
    expect(video).toHaveAttribute("loop");
  });

  it("applies autoplay attribute to video", () => {
    const { container } = render(VideoPlayer, {
      props: { src: "test.mp4", autoplay: true },
    });
    const video = container.querySelector("video");
    expect(video).toHaveAttribute("autoplay");
  });

  it("applies custom width and height", () => {
    const { container } = render(VideoPlayer, {
      props: { src: "test.mp4", width: "640px", height: "480px" },
    });
    const region = container.querySelector(".cy-video") as HTMLElement;
    expect(region.style.width).toBe("640px");
    expect(region.style.height).toBe("480px");
  });

  it("does not set height style when height is auto", () => {
    const { container } = render(VideoPlayer, {
      props: { src: "test.mp4", height: "auto" },
    });
    const region = container.querySelector(".cy-video") as HTMLElement;
    // height should not be set (undefined means it won't appear in inline style)
    expect(region.style.height).toBe("");
  });

  it("toggles play/pause on video click", async () => {
    const { container } = render(VideoPlayer, { props: { src: "test.mp4" } });
    const video = container.querySelector("video") as HTMLVideoElement;
    // Mock play and pause
    video.play = vi.fn().mockResolvedValue(undefined);
    video.pause = vi.fn();
    Object.defineProperty(video, "paused", { value: true, writable: true, configurable: true });

    await fireEvent.click(video);
    expect(video.play).toHaveBeenCalled();
  });

  it("calls onplay callback when video plays", async () => {
    const onplay = vi.fn();
    const { container } = render(VideoPlayer, {
      props: { src: "test.mp4", onplay },
    });
    const video = container.querySelector("video")!;
    await fireEvent.play(video);
    expect(onplay).toHaveBeenCalled();
  });

  it("calls onpause callback when video pauses", async () => {
    const onpause = vi.fn();
    const { container } = render(VideoPlayer, {
      props: { src: "test.mp4", onpause },
    });
    const video = container.querySelector("video")!;
    await fireEvent.pause(video);
    expect(onpause).toHaveBeenCalled();
  });

  it("calls onended callback when video ends", async () => {
    const onended = vi.fn();
    const { container } = render(VideoPlayer, {
      props: { src: "test.mp4", onended },
    });
    const video = container.querySelector("video")!;
    await fireEvent.ended(video);
    expect(onended).toHaveBeenCalled();
  });

  it("hides play overlay after play event", async () => {
    const { container } = render(VideoPlayer, { props: { src: "test.mp4" } });
    const video = container.querySelector("video")!;
    await fireEvent.play(video);
    expect(container.querySelector(".cy-video__play-overlay")).not.toBeInTheDocument();
  });

  it("shows play overlay after pause event", async () => {
    const { container } = render(VideoPlayer, { props: { src: "test.mp4" } });
    const video = container.querySelector("video")!;
    await fireEvent.play(video);
    await fireEvent.pause(video);
    expect(container.querySelector(".cy-video__play-overlay")).toBeInTheDocument();
  });

  it("shows play overlay after ended event", async () => {
    const { container } = render(VideoPlayer, { props: { src: "test.mp4" } });
    const video = container.querySelector("video")!;
    await fireEvent.play(video);
    await fireEvent.ended(video);
    expect(container.querySelector(".cy-video__play-overlay")).toBeInTheDocument();
  });

  it("shows buffering spinner on waiting event", async () => {
    const { container } = render(VideoPlayer, { props: { src: "test.mp4" } });
    const video = container.querySelector("video")!;
    await fireEvent.waiting(video);
    expect(container.querySelector(".cy-video__spinner")).toBeInTheDocument();
  });

  it("hides buffering spinner on canplay event", async () => {
    const { container } = render(VideoPlayer, { props: { src: "test.mp4" } });
    const video = container.querySelector("video")!;
    await fireEvent.waiting(video);
    await fireEvent.canPlay(video);
    expect(container.querySelector(".cy-video__spinner")).not.toBeInTheDocument();
  });

  it("displays time as 0:00 / 0:00 initially", () => {
    const { container } = render(VideoPlayer, { props: { src: "test.mp4" } });
    const time = container.querySelector(".cy-video__time");
    expect(time?.textContent).toContain("0:00");
  });

  it("has mute button", () => {
    render(VideoPlayer, { props: { src: "test.mp4" } });
    expect(screen.getByLabelText("Mute")).toBeInTheDocument();
  });

  it("has volume slider", () => {
    render(VideoPlayer, { props: { src: "test.mp4" } });
    expect(screen.getByLabelText("Volume")).toBeInTheDocument();
  });

  it("has playback speed button", () => {
    render(VideoPlayer, { props: { src: "test.mp4" } });
    expect(screen.getByLabelText("Playback speed")).toBeInTheDocument();
  });

  it("has fullscreen button", () => {
    render(VideoPlayer, { props: { src: "test.mp4" } });
    expect(screen.getByLabelText("Fullscreen")).toBeInTheDocument();
  });

  it("has seek slider", () => {
    render(VideoPlayer, { props: { src: "test.mp4" } });
    expect(screen.getByLabelText("Seek")).toBeInTheDocument();
  });

  it("toggles speed menu on speed button click", async () => {
    const { container } = render(VideoPlayer, { props: { src: "test.mp4" } });
    const speedBtn = screen.getByLabelText("Playback speed");
    await fireEvent.click(speedBtn);
    expect(container.querySelector(".cy-video__speed-menu")).toBeInTheDocument();
    await fireEvent.click(speedBtn);
    expect(container.querySelector(".cy-video__speed-menu")).not.toBeInTheDocument();
  });

  it("renders speed options in speed menu", async () => {
    const { container } = render(VideoPlayer, { props: { src: "test.mp4" } });
    const speedBtn = screen.getByLabelText("Playback speed");
    await fireEvent.click(speedBtn);
    const options = container.querySelectorAll(".cy-video__speed-option");
    expect(options.length).toBe(4); // 0.5, 1, 1.5, 2
  });

  it("shows controls on mouse move", async () => {
    const { container } = render(VideoPlayer, { props: { src: "test.mp4" } });
    const region = container.querySelector(".cy-video")!;
    await fireEvent.mouseMove(region);
    expect(container.querySelector(".cy-video__controls--visible")).toBeInTheDocument();
  });

  it("hides play overlay when buffering", async () => {
    const { container } = render(VideoPlayer, { props: { src: "test.mp4" } });
    const video = container.querySelector("video")!;
    await fireEvent.waiting(video);
    // When buffering, play overlay should not be shown (isBuffering = true)
    expect(container.querySelector(".cy-video__play-overlay")).not.toBeInTheDocument();
  });

  it("has preload=metadata on video element", () => {
    const { container } = render(VideoPlayer, { props: { src: "test.mp4" } });
    const video = container.querySelector("video");
    expect(video).toHaveAttribute("preload", "metadata");
  });

  it("shows play button when paused in controls bar", () => {
    render(VideoPlayer, { props: { src: "test.mp4" } });
    expect(screen.getByLabelText("Play")).toBeInTheDocument();
  });

  it("clicking play overlay calls togglePlay", async () => {
    const { container } = render(VideoPlayer, { props: { src: "test.mp4" } });
    const video = container.querySelector("video") as HTMLVideoElement;
    video.play = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(video, "paused", { value: true, writable: true, configurable: true });
    const overlay = screen.getByLabelText("Play video");
    await fireEvent.click(overlay);
    expect(video.play).toHaveBeenCalled();
  });

  it("controls hide after timeout while playing", async () => {
    const { container } = render(VideoPlayer, { props: { src: "test.mp4" } });
    const video = container.querySelector("video")!;
    await fireEvent.play(video);
    // scheduleHide sets a 3000ms timeout
    vi.advanceTimersByTime(3100);
    await tick();
    expect(container.querySelector(".cy-video__controls--visible")).not.toBeInTheDocument();
  });

  it("controls stay visible on mouse move and rehide", async () => {
    const { container } = render(VideoPlayer, { props: { src: "test.mp4" } });
    const video = container.querySelector("video")!;
    const region = container.querySelector(".cy-video")!;
    await fireEvent.play(video);
    vi.advanceTimersByTime(2000);
    await tick();
    await fireEvent.mouseMove(region);
    await tick();
    expect(container.querySelector(".cy-video__controls--visible")).toBeInTheDocument();
    vi.advanceTimersByTime(3100);
    await tick();
    expect(container.querySelector(".cy-video__controls--visible")).not.toBeInTheDocument();
  });

  it("controls hide on mouse leave while playing", async () => {
    const { container } = render(VideoPlayer, { props: { src: "test.mp4" } });
    const video = container.querySelector("video")!;
    const region = container.querySelector(".cy-video")!;
    await fireEvent.play(video);
    await fireEvent.mouseLeave(region);
    vi.advanceTimersByTime(1100);
    await tick();
    expect(container.querySelector(".cy-video__controls--visible")).not.toBeInTheDocument();
  });
});
