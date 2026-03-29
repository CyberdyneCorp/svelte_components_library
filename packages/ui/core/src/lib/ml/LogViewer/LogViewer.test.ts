import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import LogViewer from "./LogViewer.svelte";

describe("LogViewer", () => {
  const sampleLogs = [
    { timestamp: "10:00:00", level: "info" as const, message: "Server started" },
    { timestamp: "10:00:01", level: "error" as const, message: "Connection failed" },
    { timestamp: "10:00:02", level: "warn" as const, message: "High memory" },
  ];

  it("renders with default props", () => {
    render(LogViewer);
    const el = document.querySelector(".cy-log");
    expect(el).toBeInTheDocument();
  });

  it("displays log messages", () => {
    render(LogViewer, { props: { logs: sampleLogs } });
    expect(screen.getByText("Server started")).toBeInTheDocument();
    expect(screen.getByText("Connection failed")).toBeInTheDocument();
  });

  it("shows filter buttons", () => {
    render(LogViewer, { props: { logs: sampleLogs } });
    expect(screen.getByText("all")).toBeInTheDocument();
    expect(screen.getByText("error")).toBeInTheDocument();
  });

  it("displays timestamps when showTimestamp is true", () => {
    render(LogViewer, { props: { logs: sampleLogs, showTimestamp: true } });
    expect(screen.getByText("10:00:00")).toBeInTheDocument();
  });

  it("displays level badges when showLevel is true", () => {
    render(LogViewer, { props: { logs: sampleLogs, showLevel: true } });
    expect(screen.getByText("INFO")).toBeInTheDocument();
    expect(screen.getByText("ERROR")).toBeInTheDocument();
  });
});
