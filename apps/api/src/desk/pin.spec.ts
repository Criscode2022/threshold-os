import assert from "node:assert/strict";
import { describe, it } from "node:test";

function authorizePickup(guardians: { can_pickup: boolean; pickup_pin: string; name: string }[], pin: string) {
  return guardians.find((g) => g.can_pickup && g.pickup_pin === pin) ?? null;
}

describe("authorized pickup", () => {
  const guardians = [
    { can_pickup: true, pickup_pin: "4419", name: "Marta Navarro" },
    { can_pickup: true, pickup_pin: "8821", name: "Pau Serra" },
    { can_pickup: false, pickup_pin: "0000", name: "Neighbour" },
  ];

  it("rejects an unknown PIN", () => {
    assert.equal(authorizePickup(guardians, "0000")?.name, undefined);
    assert.equal(authorizePickup(guardians, "9999"), null);
  });

  it("releases to the named guardian", () => {
    assert.equal(authorizePickup(guardians, "4419")?.name, "Marta Navarro");
  });
});
