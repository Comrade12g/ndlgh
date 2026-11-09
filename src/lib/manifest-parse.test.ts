import { describe, it, expect } from "bun:test";
import { parsePasted, rowsFromGrid, normalizeMark } from "./manifest-parse";

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

describe("China warehouse format", () => {
  const H = ["日期", "客户名", "货名", "Item Name", "电话号码", "总件数", "快递单号", "件数", "毛重", "毛重总和", "单件体积", "体积总和", "备注"];
  it("extracts ND#### mark and uses total weight and total CBM", () => {
    const rows = rowsFromGrid([H, ["2026.10.27", "ND0043/Mary Dugba", "一次性餐盒", "Disposable Food Containers", "", 2, "910067335092001/910067335092002/", 2, 7.6, 15.2, 0.079712, 0.159424]]);
    expect(rows[0]).toEqual({ mark: "ND0043", tracking: "910067335092001/910067335092002", description: "Disposable Food Containers", pieces: 2, weight_kg: 15.2, cbm: 0.159424 });
  });
  it("normalizes NDL0054 to ND0054", () => {
    expect(normalizeMark("NDL0054/Samuel Tanson")).toBe("ND0054");
  });
  it("merges cartons sharing one tracking number", () => {
    const rows = rowsFromGrid([H,
      ["", "ND0043/Mary Dugba", "", "Buckets", "", 1, "710108463966", 1, 18.4, 18.4, 0.2, 0.2],
      ["", "ND0043/Mary Dugba", "", "Buckets", "", 1, "710108463966", 1, 14.8, 14.8, 0.3, 0.3],
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].pieces).toBe(2);
    expect(rows[0].weight_kg).toBe(33.2);
    expect(rows[0].cbm).toBe(0.5);
  });
});
