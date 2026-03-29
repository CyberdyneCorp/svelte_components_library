import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import FileDropzone from "./FileDropzone.svelte";

describe("FileDropzone", () => {
  it("renders with default props", () => {
    const { container } = render(FileDropzone);
    const dropzone = container.querySelector(".cy-dropzone");
    expect(dropzone).toBeInTheDocument();
  });

  it("has button role", () => {
    const { container } = render(FileDropzone);
    const zone = container.querySelector("[role='button']");
    expect(zone).toBeInTheDocument();
  });

  it("has aria-label for accessibility", () => {
    const { container } = render(FileDropzone);
    const zone = container.querySelector("[aria-label='File upload dropzone']");
    expect(zone).toBeInTheDocument();
  });

  it("is marked aria-disabled when disabled", () => {
    const { container } = render(FileDropzone, { props: { disabled: true } });
    const zone = container.querySelector("[role='button']");
    expect(zone?.getAttribute("aria-disabled")).toBe("true");
  });
});
