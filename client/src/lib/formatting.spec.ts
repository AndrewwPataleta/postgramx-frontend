import { describe, it, expect } from "vitest";
import { formatUiLabel, formatStatusLabel } from "./formatting";

describe("formatUiLabel", () => {
  it("turns snake_case and kebab-case into title case", () => {
    expect(formatUiLabel("payment_pending")).toBe("Payment Pending");
    expect(formatUiLabel("owner-accepted")).toBe("Owner Accepted");
  });

  it("keeps known acronyms uppercase", () => {
    expect(formatUiLabel("ton_wallet")).toBe("TON Wallet");
    expect(formatUiLabel("user_id")).toBe("User ID");
  });

  it("collapses repeated separators and whitespace", () => {
    expect(formatUiLabel("  multiple   __ spaces ")).toBe("Multiple Spaces");
  });

  it("returns an empty string for blank input", () => {
    expect(formatUiLabel("   ")).toBe("");
  });
});

describe("formatStatusLabel", () => {
  it("returns an empty string when the status is missing", () => {
    expect(formatStatusLabel()).toBe("");
    expect(formatStatusLabel("")).toBe("");
  });

  it("falls back to a humanized label for unknown statuses", () => {
    expect(formatStatusLabel("some_unmapped_status")).toBe("Some Unmapped Status");
  });
});
