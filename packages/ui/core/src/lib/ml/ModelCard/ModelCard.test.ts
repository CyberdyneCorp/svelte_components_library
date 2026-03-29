import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import ModelCard from "./ModelCard.svelte";

describe("ModelCard", () => {
  it("renders with default props", () => {
    render(ModelCard);
    const el = document.querySelector(".cy-mc");
    expect(el).toBeInTheDocument();
  });

  it("displays model name and version", () => {
    render(ModelCard, { props: { name: "GPT-4", version: "1.0" } });
    expect(screen.getByText("GPT-4")).toBeInTheDocument();
    expect(screen.getByText("v1.0")).toBeInTheDocument();
  });

  it("shows status badge", () => {
    render(ModelCard, { props: { name: "Model", status: "deployed" } });
    expect(screen.getByText("Deployed")).toBeInTheDocument();
  });

  it("renders metrics", () => {
    const metrics = [{ label: "Accuracy", value: "95.2%" }];
    render(ModelCard, { props: { name: "Model", metrics } });
    expect(screen.getByText("Accuracy")).toBeInTheDocument();
    expect(screen.getByText("95.2%")).toBeInTheDocument();
  });

  it("calls ondeploy when deploy button is clicked", async () => {
    const ondeploy = vi.fn();
    render(ModelCard, { props: { name: "Model", ondeploy } });
    await fireEvent.click(screen.getByText("Deploy"));
    expect(ondeploy).toHaveBeenCalledOnce();
  });
});
