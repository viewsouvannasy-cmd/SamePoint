import { describe, expect, it, vi, beforeEach } from "vitest";

// --- Mocks ---

vi.mock("../../../src/configs/database.js", () => ({
  read_sql: vi.fn(),
}));

// --- Imports (after mocks) ---

import { read_sql } from "../../../src/configs/database.js";
import { isUserMember } from "../../../src/utils/query/checkValid.js";

// --- Tests ---

describe("isUserMember", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the member object when user is a member of the project", async () => {
    vi.mocked(read_sql).mockResolvedValueOnce([{ m_id: 25 }] as never);

    const result = await isUserMember(10, 1);

    expect(read_sql).toHaveBeenCalledOnce();
    expect(result).toEqual({ m_id: 25 });
  });

  it("returns undefined when user is not a member of the project", async () => {
    vi.mocked(read_sql).mockResolvedValueOnce([] as never);

    const result = await isUserMember(10, 999);

    expect(read_sql).toHaveBeenCalledOnce();
    expect(result).toBeUndefined();
  });

  it("propagates database errors", async () => {
    const dbError = new Error("DB error");
    vi.mocked(read_sql).mockRejectedValueOnce(dbError);

    await expect(isUserMember(10, 1)).rejects.toThrow("DB error");
  });
});
