import { describe, it, expect } from "vitest";
import { fileCategory, fileExtension, normalizeExtension } from "./fileTypes.js";

describe("fileExtension", () => {
  it("returns the lowercase last dot segment", () => {
    expect(fileExtension("Q3 report.final.PDF")).toBe("pdf");
    expect(fileExtension("archive.tar.gz")).toBe("gz");
  });

  it("returns an empty string without an extension", () => {
    expect(fileExtension("README")).toBe("");
    expect(fileExtension(".env")).toBe("");
    expect(fileExtension("trailing.")).toBe("");
  });

  it("ignores dots in directory names", () => {
    expect(fileExtension("v1.2/notes")).toBe("");
    expect(fileExtension("C:\\docs.old\\plan.docx")).toBe("docx");
  });
});

describe("fileCategory", () => {
  it.each([
    ["pdf", "pdf"],
    [".DOCX", "document"],
    ["csv", "spreadsheet"],
    ["pptx", "presentation"],
    ["JPEG", "image"],
    ["flac", "audio"],
    ["webm", "video"],
    ["archive.tar.gz", "archive"],
    ["App.svelte", "code"],
    ["xyz", "other"],
    ["", "other"],
  ])("classifies %s as %s", (input, category) => {
    expect(fileCategory(input)).toBe(category);
  });

  it("treats a dotfile as having no extension", () => {
    expect(fileCategory(".env")).toBe("other");
  });
});

describe("normalizeExtension", () => {
  it("strips a leading dot and lowercases", () => {
    expect(normalizeExtension(" .PNG ")).toBe("png");
  });
});
