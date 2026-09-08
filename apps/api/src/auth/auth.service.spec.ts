import assert from "node:assert/strict";
import { describe, it } from "node:test";
import bcrypt from "bcryptjs";
import { ratioOk } from "../desk/ratio.js";

describe("password hashing", () => {
  it("round-trips a director password", async () => {
    const hash = await bcrypt.hash("WillowGrove!24", 4);
    assert.equal(await bcrypt.compare("WillowGrove!24", hash), true);
    assert.equal(await bcrypt.compare("wrong", hash), false);
  });
});

describe("licensed ratio", () => {
  it("flags a room over 1:8", () => {
    assert.equal(ratioOk(1, 8, 3, 1), true);
    assert.equal(ratioOk(1, 8, 9, 1), false);
  });
});
