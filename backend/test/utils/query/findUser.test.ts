import { describe, expect, it, vi, beforeEach } from "vitest";

// --- Mocks ---

vi.mock("../../../src/configs/database.js", () => ({
  read_sql: vi.fn(),
}));

// --- Imports (after mocks) ---

import { read_sql } from "../../../src/configs/database.js";
import { findUserById } from "../../../src/utils/query/findUser.js";

// --- Tests ---

describe("findUserById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns user refresh tokens when user exists", async () => {
    const rows = [
      {
        refresh_token_mobile: "mobile-hash",
        refresh_token_web: "web-hash",
      },
    ];
    vi.mocked(read_sql).mockResolvedValueOnce(rows as never);

    const result = await findUserById(7);

    expect(read_sql).toHaveBeenCalledOnce();
    expect(result).toEqual(rows);
  });

  it("returns an empty array when user does not exist", async () => {
    vi.mocked(read_sql).mockResolvedValueOnce([] as never);

    const result = await findUserById(999);

    expect(read_sql).toHaveBeenCalledOnce();
    expect(result).toEqual([]);
  });

  it("propagates database errors", async () => {
    const dbError = new Error("Connection lost");
    vi.mocked(read_sql).mockRejectedValueOnce(dbError);

    await expect(findUserById(7)).rejects.toThrow("Connection lost");
  });
});
