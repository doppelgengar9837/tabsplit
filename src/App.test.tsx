import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "./App";

afterEach(cleanup);

describe("App", () => {
  it("renders the title and an empty form", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "tabsplit" })).toBeTruthy();
    expect((screen.getByLabelText("Tab name") as HTMLInputElement).value).toBe("");
  });
});
