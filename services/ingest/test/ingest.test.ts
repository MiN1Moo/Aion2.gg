import { describe, expect, it } from "vitest";
import { createMockAdapter } from "../src/mock";
import { contentHash } from "../src/run";
import { Profile } from "../src/types";

describe("mock adapter + validation", () => {
  const a = createMockAdapter(10);
  it("covers all 7 regions with region-specific level caps", async () => {
    const regions = await a.listRegions();
    expect(regions).toHaveLength(7);
    expect(regions.find((r) => r.code === "KR")!.maxLevel).toBe(50);
    expect(regions.find((r) => r.code === "EU")!.maxLevel).toBe(45);
  });
  it("produces valid, deterministic profiles with stable hashes", async () => {
    const p1 = Profile.parse(await a.fetchProfile("EU", "1", "mock-EU-1-3"));
    const p2 = Profile.parse(await a.fetchProfile("EU", "1", "mock-EU-1-3"));
    expect(contentHash(p1)).toBe(contentHash(p2));
  });
  it("rejects malformed external data", () => {
    expect(() => Profile.parse({ name: "", level: 0 })).toThrow();
  });
});
