import { checkEnv } from "@/utils/checkEnv";

describe("checkEnv", () => {
  it("throw error with env name when it undefined", () => {
    expect(() => checkEnv(undefined, "TOKEN_SECRET")).toThrow(
      "TOKEN_SECRET Is Not Found",
    );
  });

  it("returns the value when defined", () => {
    expect(checkEnv("abc", "TOKEN_SECRET")).toBe("abc");
  });

  it("throws when the value is an empty string", () => {
    expect(() => checkEnv("", "TOKEN_SECRET")).toThrow(
      "TOKEN_SECRET Is Not Found",
    );
  });
});
