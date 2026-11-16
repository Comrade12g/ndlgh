import { describe, expect, test } from "bun:test";
import { cbmFromCm, parseDims, outstanding, cargoVolumeTotals } from "./cargo-math";

describe("cargo math", () => {
  test("50x40x30 cm is 0.06 CBM", () => expect(cbmFromCm(50, 40, 30)).toBe(0.06));
  test("pieces multiply CBM", () => expect(cbmFromCm(50, 40, 30, 3)).toBe(0.18));
  test("bad dims give 0", () => expect(cbmFromCm(0, 40, 30)).toBe(0));
  test("parses 50*40*30", () => expect(parseDims("50*40*30")).toEqual([50, 40, 30]));
  test("rejects two numbers", () => expect(parseDims("50*40")).toBeNull());
  test("balance never negative", () => expect(outstanding(100, 150)).toBe(0));
  test("balance is total minus paid", () => expect(outstanding(230, 100)).toBe(130));
  test("recorded CBM is counted once across cargo stages", () => {
    expect(cargoVolumeTotals([
      { status: "received", cbm: "1.25" },
      { status: "weighed", cbm: 0.75 },
      { status: "loaded", cbm: 2 },
      { status: "in_transit", cbm: 3 },
      { status: "arrived_gh", cbm: 4 },
      { status: "ready_delivery", cbm: 1 },
      { status: "delivered", cbm: 6 },
    ])).toEqual({ all: 18, china: 2, shipped: 5, accra: 5, collected: 6 });
  });
  test("missing or invalid CBM does not inflate totals", () => {
    expect(cargoVolumeTotals([
      { status: "received", cbm: null },
      { status: "received", cbm: "invalid" },
      { status: "received", cbm: -5 },
      { status: "received", cbm: 0.125 },
    ]).all).toBe(0.125);
  });
});
