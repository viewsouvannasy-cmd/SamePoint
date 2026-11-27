import { describe, expect, it, vi, beforeEach } from "vitest";

// --- Mocks ---

vi.mock("../../../src/configs/database.js", () => ({
  write_sql: vi.fn(),
}));

// --- Imports (after mocks) ---

import { write_sql } from "../../../src/configs/database.js";
import { updateRefreshToken } from "../../../src/utils/query/update.js";

// --- Tests ---

describe("updateRefreshToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates refresh_token_web when platform is web", async () => {
    vi.mocked(write_sql).mockResolvedValueOnce([] as never);

    await updateRefreshToken("web", "hashed-web-token", 5);

    expect(write_sql).toHaveBeenCalledOnce();
    const [strings, ...params] = vi.mocked(write_sql).mock.calls[0];
    expect((strings as TemplateStringsArray).join(" ")).toContain(
      "refresh_token_web",
    );
    expect(params).toEqual(["hashed-web-token", 5]);
  });

  it("updates refresh_token_mobile when platform is mobile", async () => {
    vi.mocked(write_sql).mockResolvedValueOnce([] as never);

    await updateRefreshToken("mobile", "hashed-mobile-token", 8);

    expect(write_sql).toHaveBeenCalledOnce();
    const [strings, ...params] = vi.mocked(write_sql).mock.calls[0];
    expect((strings as TemplateStringsArray).join(" ")).toContain(
      "refresh_token_mobile",
    );
    expect(params).toEqual(["hashed-mobile-token", 8]);
  });

  it("supports clearing the token by passing null", async () => {
    vi.mocked(write_sql).mockResolvedValueOnce([] as never);

    await updateRefreshToken("mobile", null, 8);

    expect(write_sql).toHaveBeenCalledOnce();
    const [, ...params] = vi.mocked(write_sql).mock.calls[0];
    expect(params).toEqual([null, 8]);
  });

  it("propagates database errors", async () => {
    vi.mocked(write_sql).mockRejectedValueOnce(new Error("Write failed"));

    await expect(
      updateRefreshToken("mobile", "token", 8),
    ).rejects.toThrow("Write failed");
  });
});
