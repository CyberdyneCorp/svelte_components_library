import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import PixelRadio from "./PixelRadio.svelte";

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma", disabled: true },
];

describe("PixelRadio", () => {
  it("renders each option", () => {
    render(PixelRadio, { props: { name: "x", options } });
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });
  it("renders legend when provided", () => {
    render(PixelRadio, { props: { name: "x", options, legend: "Pick one" } });
    expect(screen.getByText("Pick one")).toBeInTheDocument();
  });
  it("marks selected value as checked", () => {
    render(PixelRadio, { props: { name: "x", options, value: "b" } });
    const radios = screen.getAllByRole("radio");
    expect((radios[1] as HTMLInputElement).checked).toBe(true);
    expect((radios[0] as HTMLInputElement).checked).toBe(false);
  });
  it("fires onChange with new value", async () => {
    const onChange = vi.fn();
    render(PixelRadio, { props: { name: "x", options, onChange } });
    await fireEvent.click(screen.getByLabelText("Alpha"));
    expect(onChange).toHaveBeenCalledWith("a");
  });
  it("disables option via disabled prop", () => {
    render(PixelRadio, { props: { name: "x", options } });
    expect(screen.getByLabelText("Gamma")).toBeDisabled();
  });
  it("uses the given name on all inputs", () => {
    render(PixelRadio, { props: { name: "foo", options } });
    screen.getAllByRole("radio").forEach((r) => expect(r).toHaveAttribute("name", "foo"));
  });
});
