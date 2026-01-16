import { policy } from "../src";

describe("policy registry", () => {
  it("stores and retrieves a policy", () => {
    const fn = () => true;
    policy.define("test.action", fn);

    expect(policy.get("test.action")).toBe(fn);
  });
});
