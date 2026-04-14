import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import PixelFileIcon from "./PixelFileIcon.svelte";

describe("PixelFileIcon", () => {
  it("renders img role", () => {
    render(PixelFileIcon);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });
  it("default aria label is 'file'", () => {
    render(PixelFileIcon);
    expect(screen.getByLabelText("file")).toBeInTheDocument();
  });
  it("includes name in label", () => {
    render(PixelFileIcon, { props: { name: "readme.md" } });
    expect(screen.getByLabelText("file: readme.md")).toBeInTheDocument();
  });
  it("ariaLabel overrides default", () => {
    render(PixelFileIcon, { props: { ariaLabel: "Custom" } });
    expect(screen.getByLabelText("Custom")).toBeInTheDocument();
  });
  it.each(["file", "folder", "image", "code", "archive", "pdf"] as const)("applies %s kind class", (kind) => {
    const { container } = render(PixelFileIcon, { props: { kind } });
    expect(container.querySelector(`.cy-pfile--${kind}`)).toBeInTheDocument();
  });
  it("derives extension from name", () => {
    render(PixelFileIcon, { props: { name: "readme.md" } });
    expect(screen.getByTestId("cy-pfile-ext")).toHaveTextContent("md");
  });
  it("uses explicit extension over name", () => {
    render(PixelFileIcon, { props: { name: "file.txt", extension: "json" } });
    expect(screen.getByTestId("cy-pfile-ext")).toHaveTextContent("json");
  });
  it("omits ext when neither present", () => {
    render(PixelFileIcon, { props: { name: "noext" } });
    expect(screen.queryByTestId("cy-pfile-ext")).not.toBeInTheDocument();
  });
  it("folder kind does not render extension badge", () => {
    render(PixelFileIcon, { props: { kind: "folder", name: "dir.folder" } });
    expect(screen.queryByTestId("cy-pfile-ext")).not.toBeInTheDocument();
  });
  it("applies size and color via CSS vars", () => {
    render(PixelFileIcon, { props: { size: 48, color: "#ff0" } });
    const el = screen.getByTestId("cy-pfile");
    expect(el.style.getPropertyValue("--cy-pfile-size")).toBe("48px");
    expect(el.style.getPropertyValue("--cy-pfile-color")).toBe("#ff0");
  });
});
