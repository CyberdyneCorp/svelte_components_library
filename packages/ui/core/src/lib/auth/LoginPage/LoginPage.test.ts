import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import LoginPage from "./LoginPage.svelte";

describe("LoginPage", () => {
  it("renders with default props", () => {
    render(LoginPage);
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });

  it("displays custom title and subtitle", () => {
    render(LoginPage, { props: { title: "Log In Now", subtitle: "Enter credentials" } });
    expect(screen.getByText("Log In Now")).toBeInTheDocument();
    expect(screen.getByText("Enter credentials")).toBeInTheDocument();
  });

  it("shows error message when provided", () => {
    render(LoginPage, { props: { error: "Invalid credentials" } });
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Invalid credentials");
  });

  it("renders email and password fields in credentials mode", () => {
    render(LoginPage, { props: { mode: "credentials" } });
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("disables submit button when loading", () => {
    render(LoginPage, { props: { loading: true } });
    const submitBtn = screen.getByText("Signing in...").closest("button");
    expect(submitBtn).toBeDisabled();
  });
});
