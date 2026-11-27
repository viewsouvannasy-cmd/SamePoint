import { describe, expect, it, vi, beforeEach } from "vitest";
import type { NextFunction, Request, Response } from "express";

// --- Mocks ---

vi.mock("../../../src/controllers/user/user-query.js", () => ({
  getUserData: vi.fn(),
  readUserProfile: vi.fn(),
  updateUserName: vi.fn(),
}));

// --- Imports (after mocks) ---

import { readUserProfile } from "../../../src/controllers/user/user-query.js";
import { getUserProfile } from "../../../src/controllers/user/user-controller.js";

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

describe("getUserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Validation ────────────────────────────────────────────────────────────

  describe("validation", () => {
    it("returns 401 when user_id is missing", async () => {
      const req = makeReq({});
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await getUserProfile(req, res, next);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: expect.any(String),
        data: [],
      });
      expect(readUserProfile).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 when user_id is not a number", async () => {
      const req = makeReq({ user_id: "1" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await getUserProfile(req, res, next);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Invalid id",
        data: [],
      });
      expect(readUserProfile).not.toHaveBeenCalled();
    });

    it("returns 401 when user_id is zero or negative", async () => {
      const req = makeReq({ user_id: 0 });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await getUserProfile(req, res, next);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Invalid id",
        data: [],
      });
      expect(readUserProfile).not.toHaveBeenCalled();
    });

    it("returns 401 when user_id is not an integer", async () => {
      const req = makeReq({ user_id: 1.5 });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await getUserProfile(req, res, next);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Invalid id",
        data: [],
      });
      expect(readUserProfile).not.toHaveBeenCalled();
    });
  });

  // ── User lookup & response ────────────────────────────────────────────────

  describe("user lookup", () => {
    it("returns 401 when user profile is not found", async () => {
      vi.mocked(readUserProfile).mockResolvedValueOnce([]);

      const req = makeReq({ user_id: 42 });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await getUserProfile(req, res, next);

      expect(readUserProfile).toHaveBeenCalledWith(42);
      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "User Is Not Found",
        data: [],
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 200 with profile data when user exists", async () => {
      const profile = [
        { avatar_seed: "seed_abc", profile_url: "https://example.com/p.png" },
      ] as [{ avatar_seed: string; profile_url: string }];
      vi.mocked(readUserProfile).mockResolvedValueOnce(profile);

      const req = makeReq({ user_id: 42 });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await getUserProfile(req, res, next);

      expect(readUserProfile).toHaveBeenCalledWith(42);
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        ok: true,
        msg: "Success",
        data: profile,
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ── Error handling ────────────────────────────────────────────────────────

  describe("error handling", () => {
    it("forwards unexpected errors to next()", async () => {
      const dbError = new Error("DB error");
      vi.mocked(readUserProfile).mockRejectedValueOnce(dbError);

      const req = makeReq({ user_id: 42 });
      const { res, status } = mockResponse();
      const next = mockNext();

      await getUserProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(dbError);
      expect(status).not.toHaveBeenCalled();
    });
  });
});
