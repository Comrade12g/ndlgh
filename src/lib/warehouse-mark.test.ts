import { describe, it, expect } from "vitest";
import { buildSupplierText } from "./warehouse-mark";
describe("supplier address", () => {
  it("air repeats mark and name after address", () => {
    expect(buildSupplierText({ code: "WP", name: "Air", mark_prefix: "WP", phones: "13428888064", address_local: "广东省广州市越秀区广园西路94号迦南地国际采购中心1楼1037铺" }, "ND0101", "Owusu Michael"))
      .toBe("【WP-ND0101】Owusu Michael 13428888064 广东省广州市越秀区广园西路94号迦南地国际采购中心1楼1037铺 【WP-ND0101】Owusu Michael");
  });
  it("sea repeats mark and name after address", () => {
    const t = buildSupplierText({ code: "CN", name: "NDL Guangzhou", mark_prefix: "GHO0007", address_local: "ADDR", phones: "123" }, "ND0101", "Owusu Michael");
    expect(t.split("\n\n")).toEqual(["Guangzhou", "Mark: ND0101 Owusu Michael", "ADDR", "ND0101 Owusu Michael", "Tel: 123"]);
  });
});
