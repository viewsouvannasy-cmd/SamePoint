import { describe, expect, it, vi, beforeEach } from "vitest";
import type { NextFunction, Request, Response } from "express";

// --- Mocks ---

vi.mock("../../../src/controllers/user/user-query.js", () => ({
  getUserData: vi.fn(),
  readUserProfile: vi.fn(),
  updateUserName: vi.fn(),
}));

// --- Imports (after mocks) ---

import { getUserData } from "../../../src/controllers/user/user-query.js";
import { getUserInfo } from "../../../src/controllers/user/user-controller.js";

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

describe("getUserInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Validation ────────────────────────────────────────────────────────────

  describe("validation", () => {
    it("returns 401 when user_id is missing", async () => {
      const req = makeReq({});
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await getUserInfo(req, res, next);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: expect.any(String),
        data: [],
      });
      expect(getUserData).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 when user_id is not a positive integer", async () => {
      const req = makeReq({ user_id: -5 });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await getUserInfo(req, res, next);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Invalid id",
        data: [],
      });
      expect(getUserData).not.toHaveBeenCalled();
    });

    it("returns 401 when user_id is a string", async () => {
      const req = makeReq({ user_id: "10" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await getUserInfo(req, res, next);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Invalid id",
        data: [],
      });
      expect(getUserData).not.toHaveBeenCalled();
    });
  });

  // ── User lookup & response ────────────────────────────────────────────────

  describe("user lookup", () => {
    it("returns 401 when user is not found", async () => {
      vi.mocked(getUserData).mockResolvedValueOnce([]);

      const req = makeReq({ user_id: 5 });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await getUserInfo(req, res, next);

      expect(getUserData).toHaveBeenCalledWith(5);
      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "User Is Not Found",
        data: [],
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 200 with user info when user exists", async () => {
      const userData = [
        {
          user_name: "Alice",
          user_email: "alice@example.com",
          avatar_seed: "seed123",
          profile_url: "",
          total_archive_project: 2,
        },
      ] as [
        {
          user_name: string;
          user_email: string;
          avatar_seed: string;
          profile_url: string;
          total_archive_project: number;
        },
      ];
      vi.mocked(getUserData).mockResolvedValueOnce(userData);

      const req = makeReq({ user_id: 5 });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await getUserInfo(req, res, next);

      expect(getUserData).toHaveBeenCalledWith(5);
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        ok: true,
        msg: "Success",
        data: userData,
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ── Error handling ────────────────────────────────────────────────────────

  describe("error handling", () => {
    it("forwards unexpected errors to next()", async () => {
      const dbError = new Error("DB error");
      vi.mocked(getUserData).mockRejectedValueOnce(dbError);

      const req = makeReq({ user_id: 5 });
      const { res, status } = mockResponse();
      const next = mockNext();

      await getUserInfo(req, res, next);

      expect(next).toHaveBeenCalledWith(dbError);
      expect(status).not.toHaveBeenCalled();
    });
  });
});
