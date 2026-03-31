import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import FileDropzone from "./FileDropzone.svelte";

function createFile(name: string, size: number, type: string): File {
  const content = new ArrayBuffer(size);
  return new File([content], name, { type });
}

function createFileList(files: File[]): FileList {
  // jsdom doesn't support DataTransfer, so mock FileList
  const fileList = Object.create(FileList.prototype);
  for (let i = 0; i < files.length; i++) {
    fileList[i] = files[i];
  }
  Object.defineProperty(fileList, "length", { value: files.length });
  Object.defineProperty(fileList, "item", {
    value: (idx: number) => files[idx] ?? null,
  });
  return fileList;
}

describe("FileDropzone", () => {
  it("renders with default props", () => {
    const { container } = render(FileDropzone);
    expect(container.querySelector(".cy-dropzone")).toBeInTheDocument();
  });

  it("has button role on dropzone area", () => {
    const { container } = render(FileDropzone);
    expect(container.querySelector("[role='button']")).toBeInTheDocument();
  });

  it("has aria-label for accessibility", () => {
    const { container } = render(FileDropzone);
    expect(
      container.querySelector("[aria-label='File upload dropzone']")
    ).toBeInTheDocument();
  });

  it("is marked aria-disabled when disabled", () => {
    const { container } = render(FileDropzone, { props: { disabled: true } });
    const zone = container.querySelector("[role='button']");
    expect(zone?.getAttribute("aria-disabled")).toBe("true");
  });

  it("applies disabled class", () => {
    const { container } = render(FileDropzone, { props: { disabled: true } });
    expect(container.querySelector(".cy-dropzone--disabled")).toBeInTheDocument();
  });

  it("shows default text", () => {
    const { container } = render(FileDropzone);
    expect(container.textContent).toContain("Drop files here or click to browse");
  });

  it("shows accepted types when accept is set", () => {
    const { container } = render(FileDropzone, { props: { accept: ".png,.jpg" } });
    expect(container.textContent).toContain("Accepted: .png,.jpg");
  });

  it("does not show accepted types when accept is empty", () => {
    const { container } = render(FileDropzone);
    expect(container.textContent).not.toContain("Accepted:");
  });

  it("shows max size when maxSize is set", () => {
    const { container } = render(FileDropzone, { props: { maxSize: 5 } });
    expect(container.textContent).toContain("Max size: 5MB");
  });

  it("does not show max size when not set", () => {
    const { container } = render(FileDropzone);
    expect(container.textContent).not.toContain("Max size:");
  });

  it("sets tabindex to 0 when not disabled", () => {
    const { container } = render(FileDropzone);
    const zone = container.querySelector("[role='button']");
    expect(zone?.getAttribute("tabindex")).toBe("0");
  });

  it("sets tabindex to -1 when disabled", () => {
    const { container } = render(FileDropzone, { props: { disabled: true } });
    const zone = container.querySelector("[role='button']");
    expect(zone?.getAttribute("tabindex")).toBe("-1");
  });

  it("applies dragging class on dragover", async () => {
    const { container } = render(FileDropzone);
    const zone = container.querySelector("[role='button']")!;
    await fireEvent.dragOver(zone);
    expect(
      container.querySelector(".cy-dropzone__area--dragging")
    ).toBeInTheDocument();
  });

  it("removes dragging class on dragleave", async () => {
    const { container } = render(FileDropzone);
    const zone = container.querySelector("[role='button']")!;
    await fireEvent.dragOver(zone);
    expect(
      container.querySelector(".cy-dropzone__area--dragging")
    ).toBeInTheDocument();
    await fireEvent.dragLeave(zone);
    expect(
      container.querySelector(".cy-dropzone__area--dragging")
    ).not.toBeInTheDocument();
  });

  it("does not apply dragging class when disabled", async () => {
    const { container } = render(FileDropzone, { props: { disabled: true } });
    const zone = container.querySelector("[role='button']")!;
    await fireEvent.dragOver(zone);
    expect(
      container.querySelector(".cy-dropzone__area--dragging")
    ).not.toBeInTheDocument();
  });

  it("calls onfiles on valid file drop", async () => {
    const onfiles = vi.fn();
    const { container } = render(FileDropzone, { props: { onfiles } });
    const zone = container.querySelector("[role='button']")!;
    const file = createFile("test.txt", 100, "text/plain");
    const fileList = createFileList([file]);
    await fireEvent.drop(zone, {
      dataTransfer: { files: fileList },
    });
    expect(onfiles).toHaveBeenCalledTimes(1);
  });

  it("does not call onfiles on drop when disabled", async () => {
    const onfiles = vi.fn();
    const { container } = render(FileDropzone, { props: { onfiles, disabled: true } });
    const zone = container.querySelector("[role='button']")!;
    const file = createFile("test.txt", 100, "text/plain");
    const fileList = createFileList([file]);
    await fireEvent.drop(zone, {
      dataTransfer: { files: fileList },
    });
    expect(onfiles).not.toHaveBeenCalled();
  });

  it("removes dragging class after drop", async () => {
    const { container } = render(FileDropzone);
    const zone = container.querySelector("[role='button']")!;
    await fireEvent.dragOver(zone);
    const file = createFile("test.txt", 100, "text/plain");
    const fileList = createFileList([file]);
    await fireEvent.drop(zone, {
      dataTransfer: { files: fileList },
    });
    expect(
      container.querySelector(".cy-dropzone__area--dragging")
    ).not.toBeInTheDocument();
  });

  it("shows error when file exceeds maxSize", async () => {
    const onfiles = vi.fn();
    const { container } = render(FileDropzone, {
      props: { onfiles, maxSize: 1 }, // 1MB
    });
    const zone = container.querySelector("[role='button']")!;
    const bigFile = createFile("big.txt", 2 * 1024 * 1024, "text/plain"); // 2MB
    const fileList = createFileList([bigFile]);
    await fireEvent.drop(zone, {
      dataTransfer: { files: fileList },
    });
    expect(onfiles).not.toHaveBeenCalled();
    const error = container.querySelector("[role='alert']");
    expect(error).toBeInTheDocument();
    expect(error?.textContent).toContain("exceeds 1MB limit");
  });

  it("does not show error when file is within maxSize", async () => {
    const onfiles = vi.fn();
    const { container } = render(FileDropzone, {
      props: { onfiles, maxSize: 5 },
    });
    const zone = container.querySelector("[role='button']")!;
    const smallFile = createFile("small.txt", 1024, "text/plain"); // 1KB
    const fileList = createFileList([smallFile]);
    await fireEvent.drop(zone, {
      dataTransfer: { files: fileList },
    });
    expect(onfiles).toHaveBeenCalledTimes(1);
    expect(container.querySelector("[role='alert']")).not.toBeInTheDocument();
  });

  it("clears previous error on new valid drop", async () => {
    const onfiles = vi.fn();
    const { container } = render(FileDropzone, {
      props: { onfiles, maxSize: 1 },
    });
    const zone = container.querySelector("[role='button']")!;
    // First drop: too big
    const bigFile = createFile("big.txt", 2 * 1024 * 1024, "text/plain");
    await fireEvent.drop(zone, {
      dataTransfer: { files: createFileList([bigFile]) },
    });
    expect(container.querySelector("[role='alert']")).toBeInTheDocument();
    // Second drop: valid
    const smallFile = createFile("small.txt", 512, "text/plain");
    await fireEvent.drop(zone, {
      dataTransfer: { files: createFileList([smallFile]) },
    });
    expect(container.querySelector("[role='alert']")).not.toBeInTheDocument();
  });

  it("opens file picker on click", async () => {
    const { container } = render(FileDropzone);
    const zone = container.querySelector("[role='button']")!;
    const fileInput = container.querySelector("input[type='file']") as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, "click");
    await fireEvent.click(zone);
    expect(clickSpy).toHaveBeenCalled();
  });

  it("does not open file picker on click when disabled", async () => {
    const { container } = render(FileDropzone, { props: { disabled: true } });
    const zone = container.querySelector("[role='button']")!;
    const fileInput = container.querySelector("input[type='file']") as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, "click");
    await fireEvent.click(zone);
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it("opens file picker on Enter key", async () => {
    const { container } = render(FileDropzone);
    const zone = container.querySelector("[role='button']")!;
    const fileInput = container.querySelector("input[type='file']") as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, "click");
    await fireEvent.keyDown(zone, { key: "Enter" });
    expect(clickSpy).toHaveBeenCalled();
  });

  it("opens file picker on Space key", async () => {
    const { container } = render(FileDropzone);
    const zone = container.querySelector("[role='button']")!;
    const fileInput = container.querySelector("input[type='file']") as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, "click");
    await fireEvent.keyDown(zone, { key: " " });
    expect(clickSpy).toHaveBeenCalled();
  });

  it("does not open file picker on other keys", async () => {
    const { container } = render(FileDropzone);
    const zone = container.querySelector("[role='button']")!;
    const fileInput = container.querySelector("input[type='file']") as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, "click");
    await fireEvent.keyDown(zone, { key: "a" });
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it("does not open file picker on Enter when disabled", async () => {
    const { container } = render(FileDropzone, { props: { disabled: true } });
    const zone = container.querySelector("[role='button']")!;
    const fileInput = container.querySelector("input[type='file']") as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, "click");
    await fireEvent.keyDown(zone, { key: "Enter" });
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it("sets accept attribute on file input", () => {
    const { container } = render(FileDropzone, { props: { accept: ".png,.jpg" } });
    const input = container.querySelector("input[type='file']");
    expect(input?.getAttribute("accept")).toBe(".png,.jpg");
  });

  it("sets multiple attribute on file input", () => {
    const { container } = render(FileDropzone, { props: { multiple: true } });
    const input = container.querySelector("input[type='file']");
    expect(input?.hasAttribute("multiple")).toBe(true);
  });

  it("does not set multiple when false", () => {
    const { container } = render(FileDropzone, { props: { multiple: false } });
    const input = container.querySelector("input[type='file']");
    expect(input?.hasAttribute("multiple")).toBe(false);
  });

  it("handles drop with no dataTransfer gracefully", async () => {
    const onfiles = vi.fn();
    const { container } = render(FileDropzone, { props: { onfiles } });
    const zone = container.querySelector("[role='button']")!;
    await fireEvent.drop(zone, {});
    expect(onfiles).not.toHaveBeenCalled();
  });

  it("handles empty file list on drop", async () => {
    const onfiles = vi.fn();
    const { container } = render(FileDropzone, { props: { onfiles } });
    const zone = container.querySelector("[role='button']")!;
    await fireEvent.drop(zone, {
      dataTransfer: { files: createFileList([]) },
    });
    expect(onfiles).not.toHaveBeenCalled();
  });
});
