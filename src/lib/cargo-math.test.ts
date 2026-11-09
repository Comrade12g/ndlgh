import { describe, expect, test } from "bun:test";
import { cbmFromCm, parseDims, outstanding } from "./cargo-math";

describe("cargo math", () => {
  test("50x40x30 cm is 0.06 CBM", () => expect(cbmFromCm(50, 40, 30)).toBe(0.06));
  test("pieces multiply CBM", () => expect(cbmFromCm(50, 40, 30, 3)).toBe(0.18));
  test("bad dims give 0", () => expect(cbmFromCm(0, 40, 30)).toBe(0));
  test("parses 50*40*30", () => expect(parseDims("50*40*30")).toEqual([50, 40, 30]));
  test("rejects two numbers", () => expect(parseDims("50*40")).toBeNull());
  test("balance never negative", () => expect(outstanding(100, 150)).toBe(0));
  test("balance is total minus paid", () => expect(outstanding(230, 100)).toBe(130));
});
