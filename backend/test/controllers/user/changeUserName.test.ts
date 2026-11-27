import { describe, expect, it, vi, beforeEach } from "vitest";
import type { NextFunction, Request, Response } from "express";

// --- Mocks ---

vi.mock("../../../src/controllers/user/user-query.js", () => ({
  getUserData: vi.fn(),
  readUserProfile: vi.fn(),
  updateUserName: vi.fn(),
}));

// --- Imports (after mocks) ---

import { updateUserName } from "../../../src/controllers/user/user-query.js";
import { changeUserName } from "../../../src/controllers/user/user-controller.js";

// --- Helpers ---

const mockResponse = () => {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { res: { status } as unknown as Response, status, json };
};

const mockNext = () => vi.fn() as unknown as NextFunction;

const makeReq = (body: unknown): Request =>
  ({ body }) as unknown as Request;

// --- Tests ---

describe("changeUserName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Validation ────────────────────────────────────────────────────────────

  describe("validation", () => {
    it("returns 400 when user_id is missing", async () => {
      const req = makeReq({ new_name: "Alice" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await changeUserName(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: { point: "user_id", content: expect.any(String) },
        data: [],
      });
      expect(updateUserName).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 when user_id is not a positive integer", async () => {
      const req = makeReq({ user_id: 0, new_name: "Alice" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await changeUserName(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: { point: "user_id", content: "Invalid id" },
        data: [],
      });
      expect(updateUserName).not.toHaveBeenCalled();
    });

    it("returns 400 when new_name is missing", async () => {
      const req = makeReq({ user_id: 1 });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await changeUserName(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: { point: "new_name", content: "Please provide your new name" },
        data: [],
      });
      expect(updateUserName).not.toHaveBeenCalled();
    });

    it("returns 400 when new_name is shorter than 3 characters", async () => {
      const req = makeReq({ user_id: 1, new_name: "Al" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await changeUserName(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: {
          point: "new_name",
          content: "Name must be at least 3 characters",
        },
        data: [],
      });
      expect(updateUserName).not.toHaveBeenCalled();
    });

    it("returns 400 when trimmed new_name is shorter than 3 characters", async () => {
      const req = makeReq({ user_id: 1, new_name: "  ab  " });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await changeUserName(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: {
          point: "new_name",
          content: "Name must be at least 3 characters",
        },
        data: [],
      });
      expect(updateUserName).not.toHaveBeenCalled();
    });

    it("returns 400 when new_name is longer than 30 characters", async () => {
      const req = makeReq({ user_id: 1, new_name: "A".repeat(31) });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await changeUserName(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: {
          point: "new_name",
          content: "Name must be at most 30 characters",
        },
        data: [],
      });
      expect(updateUserName).not.toHaveBeenCalled();
    });
  });

  // ── Update name flow ──────────────────────────────────────────────────────

  describe("update user name", () => {
    it("returns 401 when user is not found", async () => {
      vi.mocked(updateUserName).mockResolvedValueOnce([]);

      const req = makeReq({ user_id: 99, new_name: "Alice" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await changeUserName(req, res, next);

      expect(updateUserName).toHaveBeenCalledWith(99, "Alice");
      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "User is not found",
        data: [],
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("trims whitespace and returns 202 when update succeeds", async () => {
      vi.mocked(updateUserName).mockResolvedValueOnce([{ user_id: 1 }]);

      const req = makeReq({ user_id: 1, new_name: "  Bob Builder  " });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await changeUserName(req, res, next);

      expect(updateUserName).toHaveBeenCalledWith(1, "Bob Builder");
      expect(status).toHaveBeenCalledWith(202);
      expect(json).toHaveBeenCalledWith({
        ok: true,
        msg: "Update user name success",
        data: [],
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("accepts boundary lengths of 3 and 30 characters", async () => {
      vi.mocked(updateUserName)
        .mockResolvedValueOnce([{ user_id: 1 }])
        .mockResolvedValueOnce([{ user_id: 1 }]);

      const minReq = makeReq({ user_id: 1, new_name: "Ace" });
      const minRes = mockResponse();
      await changeUserName(minReq, minRes.res, mockNext());
      expect(minRes.status).toHaveBeenCalledWith(202);

      const maxName = "B".repeat(30);
      const maxReq = makeReq({ user_id: 1, new_name: maxName });
      const maxRes = mockResponse();
      await changeUserName(maxReq, maxRes.res, mockNext());
      expect(maxRes.status).toHaveBeenCalledWith(202);
      expect(updateUserName).toHaveBeenLastCalledWith(1, maxName);
    });
  });

  // ── Error handling ────────────────────────────────────────────────────────

  describe("error handling", () => {
    it("forwards unexpected errors to next()", async () => {
      const dbError = new Error("Update failed");
      vi.mocked(updateUserName).mockRejectedValueOnce(dbError);

      const req = makeReq({ user_id: 1, new_name: "Alice" });
      const { res, status } = mockResponse();
      const next = mockNext();

      await changeUserName(req, res, next);

      expect(next).toHaveBeenCalledWith(dbError);
      expect(status).not.toHaveBeenCalled();
    });
  });
});
