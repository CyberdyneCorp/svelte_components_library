import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import FileTypeIcon from "./FileTypeIcon.svelte";

const svg = (container: HTMLElement) => container.querySelector("svg") as SVGSVGElement;

describe("FileTypeIcon", () => {
  it("draws the extension from a filename with its category", () => {
    const { container } = render(FileTypeIcon, { props: { fileName: "Q3 report.final.PDF" } });
    expect(svg(container).textContent).toBe("PDF");
    expect(svg(container)).toHaveAttribute("data-category", "pdf");
  });

  it("prefers fileName over type", () => {
    const { container } = render(FileTypeIcon, { props: { type: "pdf", fileName: "a.csv" } });
    expect(svg(container).textContent).toBe("CSV");
  });

  it("shortens long extensions to four characters", () => {
    const { container } = render(FileTypeIcon, { props: { type: ".numbers" } });
    expect(svg(container).textContent).toBe("NUMB");
  });

  it("renders a generic page without text when there is no extension", () => {
    const { container } = render(FileTypeIcon, { props: { fileName: "README" } });
    expect(svg(container).querySelector("text")).toBeNull();
    expect(svg(container)).toHaveAttribute("data-category", "other");
  });

  it("is decorative without a label", () => {
    const { container } = render(FileTypeIcon, { props: { type: "zip" } });
    expect(svg(container)).toHaveAttribute("aria-hidden", "true");
    expect(svg(container)).not.toHaveAttribute("role");
  });

  it("is a named image with a label", () => {
    render(FileTypeIcon, { props: { type: "zip", label: "ZIP archive" } });
    const img = screen.getByRole("img", { name: "ZIP archive" });
    expect(img).not.toHaveAttribute("aria-hidden");
  });

  it("applies the size", () => {
    const { container } = render(FileTypeIcon, { props: { type: "mp3", size: 48 } });
    expect(svg(container)).toHaveAttribute("width", "48");
    expect(svg(container)).toHaveAttribute("height", "48");
  });
});
