import { describe, expect, it, vi, beforeEach } from "vitest";

// --- Mocks ---

vi.mock("../../../src/configs/database.js", () => ({
  read_sql: vi.fn(),
}));

// --- Imports (after mocks) ---

import { read_sql } from "../../../src/configs/database.js";
import { isProjectOwner } from "../../../src/utils/query/checkOwner.js";

// --- Tests ---

describe("isProjectOwner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns false when no matching member row exists", async () => {
    vi.mocked(read_sql).mockResolvedValueOnce([] as never);

    const result = await isProjectOwner(1, 10);

    expect(read_sql).toHaveBeenCalledOnce();
    expect(result).toBe(false);
  });

  it("returns true when the member is the project owner", async () => {
    vi.mocked(read_sql).mockResolvedValueOnce([{ is_owner: true }] as never);

    const result = await isProjectOwner(1, 10);

    expect(read_sql).toHaveBeenCalledOnce();
    expect(result).toBe(true);
  });

  it("returns false when the member is not the project owner", async () => {
    vi.mocked(read_sql).mockResolvedValueOnce([{ is_owner: false }] as never);

    const result = await isProjectOwner(1, 10);

    expect(read_sql).toHaveBeenCalledOnce();
    expect(result).toBe(false);
  });

  it("propagates database errors", async () => {
    const dbError = new Error("Query failed");
    vi.mocked(read_sql).mockRejectedValueOnce(dbError);

    await expect(isProjectOwner(1, 10)).rejects.toThrow("Query failed");
  });
});
