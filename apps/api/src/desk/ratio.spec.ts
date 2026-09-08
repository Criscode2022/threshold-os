import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { requiredAdults, ratioOk } from "./ratio.js";

describe("requiredAdults", () => {
  it("needs two adults at 1:8 with 9 present", () => {
    assert.equal(requiredAdults(1, 8, 9), 2);
    assert.equal(ratioOk(1, 8, 9, 1), false);
    assert.equal(ratioOk(1, 8, 9, 2), true);
  });
});
