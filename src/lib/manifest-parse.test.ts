import { describe, it, expect } from "bun:test";
import { parsePasted } from "./manifest-parse";

describe("parsePasted", () => {
  it("reads headed tab-separated list from Excel", () => {
    const rows = parsePasted("Mark\tTracking\tGoods\tCtns\tKG\tCBM\nnd0105\tSF123\tShoes\t3\t40\t0.25");
    expect(rows).toEqual([
      { mark: "ND0105", tracking: "SF123", description: "Shoes", pieces: 3, weight_kg: 40, cbm: 0.25 },
    ]);
  });
  it("uses default column order when no header", () => {
    const rows = parsePasted("ND0001,YT9,Bags,2,10,0.1");
    expect(rows[0].tracking).toBe("YT9");
    expect(rows[0].cbm).toBe(0.1);
  });
});
