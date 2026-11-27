import { describe, expect, it, vi, afterEach } from "vitest";
import { generateUserSeed } from "../../../src/utils/generate/generate.js";

describe("generateUserSeed", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("generates a 10-character seed", () => {
    const seed = generateUserSeed("Alice");

    expect(seed).toHaveLength(10);
  });

  it("removes spaces from user_name before picking characters", () => {
    const seed = generateUserSeed("  Alice   Bob  ");

    expect(seed).toHaveLength(10);
    expect(seed).not.toContain(" ");
    for (const char of seed.toLowerCase()) {
      expect("alicebob").toContain(char);
    }
  });

  it("applies uppercase when Math.random produces 1 for case selection", () => {
    // Alternating: index selection 0.0 -> index 0 ('a'), case selection 0.9 -> 1 (upper)
    let call = 0;
    vi.spyOn(Math, "random").mockImplementation(() => {
      call += 1;
      return call % 2 === 1 ? 0 : 0.9;
    });

    const seed = generateUserSeed("abc");

    expect(seed).toBe("AAAAAAAAAA");
  });

  it("applies lowercase when Math.random produces 0 for case selection", () => {
    // Alternating: index selection 0.5 -> index 1 ('b'), case selection 0.1 -> 0 (lower)
    let call = 0;
    vi.spyOn(Math, "random").mockImplementation(() => {
      call += 1;
      return call % 2 === 1 ? 0.5 : 0.1;
    });

    const seed = generateUserSeed("AbC");

    expect(seed).toBe("bbbbbbbbbb");
  });
});
