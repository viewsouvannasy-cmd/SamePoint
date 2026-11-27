import { describe, expect, it, afterEach } from "vitest";
import { getEnv } from "../../src/utils/getEnv.js";

describe("getEnv", () => {
  const TEST_KEY = "TEST_GET_ENV_KEY";
  const originalValue = process.env[TEST_KEY];

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env[TEST_KEY];
    } else {
      process.env[TEST_KEY] = originalValue;
    }
  });

  it("returns the environment variable value when it is set", () => {
    process.env[TEST_KEY] = "expected-value";

    expect(getEnv(TEST_KEY)).toBe("expected-value");
  });

  it("throws an error when the environment variable is undefined", () => {
    delete process.env[TEST_KEY];

    expect(() => getEnv(TEST_KEY)).toThrow(`${TEST_KEY} is not set`);
  });

  it("throws an error when the environment variable is an empty string", () => {
    process.env[TEST_KEY] = "";

    expect(() => getEnv(TEST_KEY)).toThrow(`${TEST_KEY} is not set`);
  });
});
