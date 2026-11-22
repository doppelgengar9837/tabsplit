import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { App } from "./App";

beforeEach(() => window.localStorage.clear());
afterEach(cleanup);

function addMember(name: string) {
  fireEvent.change(screen.getByRole("textbox", { name: "Member name" }), { target: { value: name } });
  fireEvent.click(screen.getByRole("button", { name: "Add member" }));
}

function addExpense(payer: string, amount: string, participants: string[]) {
  fireEvent.change(screen.getByRole("combobox", { name: "Payer" }), { target: { value: payer } });
  fireEvent.change(screen.getByRole("textbox", { name: "Amount" }), { target: { value: amount } });
  const group = screen.getByRole("group", { name: "Participants" });
  for (const p of participants) fireEvent.click(within(group).getByRole("checkbox", { name: p }));
  fireEvent.click(screen.getByRole("button", { name: "Add expense" }));
}

describe("App", () => {
  it("renders the four sections", () => {
    render(<App />);
    for (const name of ["Members", "Expenses", "Balances", "Settlement"]) {
      expect(screen.getByRole("heading", { name })).toBeTruthy();
    }
  });

  it("adds a member, trimming the name", () => {
    render(<App />);
    addMember("  Ann ");
    expect(screen.getByRole("button", { name: "Delete Ann" })).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("rejects empty and duplicate names with a visible message", () => {
    render(<App />);
    addMember("   ");
    expect(screen.getByRole("alert").textContent).toBe("Member name cannot be empty.");
    addMember("Ann");
    addMember("Ann");
    expect(screen.getByRole("alert").textContent).toBe("Ann is already a member.");
    expect(screen.getAllByRole("button", { name: "Delete Ann" })).toHaveLength(1);
  });

  it("blocks deleting a member an expense references", () => {
    render(<App />);
    addMember("Ann");
    addMember("Bob");
    addExpense("Ann", "10", ["Ann", "Bob"]);
    fireEvent.click(screen.getByRole("button", { name: "Delete Bob" }));
    expect(screen.getByRole("alert").textContent).toBe(
      "Cannot delete Bob: an expense still references them.",
    );
    expect(screen.getByRole("button", { name: "Delete Bob" })).toBeTruthy();
  });

  it("deletes an unreferenced member", () => {
    render(<App />);
    addMember("Ann");
    fireEvent.click(screen.getByRole("button", { name: "Delete Ann" }));
    expect(screen.queryByRole("button", { name: "Delete Ann" })).toBeNull();
  });

  it("shows a message for an invalid amount and keeps the expense out", () => {
    render(<App />);
    addMember("Ann");
    addExpense("Ann", "1.234", ["Ann"]);
    expect(screen.getByRole("alert").textContent).toBe("Amount can have at most 2 decimals.");
    expect(screen.queryByText(/paid/)).toBeNull();
  });

  it("shows the domain message when no participant is picked", () => {
    render(<App />);
    addMember("Ann");
    addExpense("Ann", "5", []);
    expect(screen.getByRole("alert").textContent).toBe("Pick at least one participant.");
  });

  it("adds an expense and shows balances and transfers", () => {
    render(<App />);
    addMember("Ann");
    addMember("Bob");
    addExpense("Ann", "10.01", ["Ann", "Bob"]);
    const balances = within(screen.getByRole("heading", { name: "Balances" }).parentElement!);
    expect(balances.getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "Ann is owed $5.00",
      "Bob owes $5.00",
    ]);
    const settlement = within(screen.getByRole("heading", { name: "Settlement" }).parentElement!);
    expect(settlement.getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "Bob pays Ann $5.00",
    ]);
  });

  it("keeps the data across a remount", () => {
    const first = render(<App />);
    addMember("Ann");
    addMember("Bob");
    addExpense("Ann", "20", ["Ann", "Bob"]);
    first.unmount();
    render(<App />);
    expect(screen.getByRole("button", { name: "Delete Bob" })).toBeTruthy();
    expect(screen.getByText("Bob owes $10.00")).toBeTruthy();
    expect(screen.getByText("Bob pays Ann $10.00")).toBeTruthy();
  });
});
