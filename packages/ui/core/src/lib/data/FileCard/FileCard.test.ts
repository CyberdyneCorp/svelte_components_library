import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import FileCard from "./FileCard.svelte";
import FileCardHarness from "./FileCardHarness.test.svelte";

describe("FileCard", () => {
  it("shows the name, meta and a file-type icon by default", () => {
    const { container } = render(FileCard, { props: { name: "budget.xlsx", meta: "12 KB" } });
    const group = screen.getByRole("group", { name: "budget.xlsx" });
    expect(group).toHaveAccessibleDescription("12 KB");
    expect(screen.getByText("budget.xlsx")).toHaveAttribute("title", "budget.xlsx");
    expect(container.querySelector(".cy-file-type-icon")?.textContent).toBe("XLSX");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls onremove from a separate remove button", async () => {
    const onremove = vi.fn();
    render(FileCard, {
      props: { name: "diagram.png", meta: "240 KB", layout: "row", onremove },
    });
    await fireEvent.click(screen.getByRole("button", { name: "Remove diagram.png" }));
    expect(onremove).toHaveBeenCalledOnce();
  });

  it("makes the name a button with onopen", async () => {
    const onopen = vi.fn();
    render(FileCard, { props: { name: "spec.pdf", onopen, onremove: vi.fn() } });
    await fireEvent.click(screen.getByRole("button", { name: "spec.pdf" }));
    expect(onopen).toHaveBeenCalledOnce();
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("uses custom open and remove labels", () => {
    render(FileCard, {
      props: {
        name: "spec.pdf",
        onopen: vi.fn(),
        onremove: vi.fn(),
        openLabel: "Abrir spec.pdf",
        removeLabel: "Remover spec.pdf",
      },
    });
    expect(screen.getByRole("button", { name: "Abrir spec.pdf" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remover spec.pdf" })).toBeInTheDocument();
  });

  it("renders an image preview and falls back to the icon when it fails", async () => {
    const { container } = render(FileCard, {
      props: { name: "photo.jpg", previewSrc: "https://example.invalid/photo.jpg" },
    });
    const img = container.querySelector("img") as HTMLImageElement;
    expect(img).toHaveAttribute("alt", "");
    await fireEvent.error(img);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector(".cy-file-type-icon")?.textContent).toBe("JPG");
  });

  it("retries the image when previewSrc changes", async () => {
    const { container, rerender } = render(FileCard, {
      props: { name: "photo.jpg", previewSrc: "https://example.invalid/a.jpg" },
    });
    await fireEvent.error(container.querySelector("img") as HTMLImageElement);
    await rerender({ name: "photo.jpg", previewSrc: "https://example.invalid/b.jpg" });
    expect(container.querySelector("img")).toHaveAttribute("src", "https://example.invalid/b.jpg");
  });

  it("prefers the preview snippet", () => {
    const { container } = render(FileCardHarness, { props: { name: "page.pdf" } });
    expect(screen.getByTestId("custom-preview")).toBeInTheDocument();
    expect(container.querySelector(".cy-file-type-icon")).toBeNull();
  });

  it("shows a named progress bar while uploading", () => {
    render(FileCard, { props: { name: "video.mp4", progress: 40 } });
    const bar = screen.getByRole("progressbar", { name: "Uploading video.mp4" });
    expect(bar).toHaveAttribute("aria-valuenow", "40");
  });

  it("clamps progress", () => {
    render(FileCard, { props: { name: "a.txt", progress: 140 } });
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("replaces progress with the error and describes the card with it", () => {
    render(FileCard, { props: { name: "video.mp4", meta: "2 GB", progress: 40, error: "Upload failed" } });
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.getByText("Upload failed")).toBeVisible();
    expect(screen.getByRole("group", { name: "video.mp4" })).toHaveAccessibleDescription("2 GB Upload failed");
  });
});
