import { describe, expect, it, vi, beforeEach } from "vitest";
import type { NextFunction, Request, Response } from "express";

// --- Mocks ---

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    compare: vi.fn(),
  },
}));

vi.mock("../../../../src/utils/getEnv.js", () => ({
  getEnv: vi.fn((key: string) => `mock_${key}`),
}));

vi.mock("../../../../src/utils/query/findUser.js", () => ({
  findUserById: vi.fn(),
}));

vi.mock("../../../../src/utils/query/update.js", () => ({
  updateRefreshToken: vi.fn(),
}));

// --- Imports (after mocks) ---

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getEnv } from "../../../../src/utils/getEnv.js";
import { findUserById } from "../../../../src/utils/query/findUser.js";
import { updateRefreshToken } from "../../../../src/utils/query/update.js";
import { handleLogOutMobile } from "../../../../src/controllers/auth/auth-controller-mobile.js";

// --- Helpers ---

const mockResponse = () => {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { res: { status } as unknown as Response, status, json };
};

const mockNext = () => vi.fn() as unknown as NextFunction;

const makeReq = (token: unknown): Request => ({ token }) as unknown as Request;

// --- Tests ---

describe("handleLogOutMobile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Token validation ──────────────────────────────────────────────────────

  describe("token validation", () => {
    it("returns 400 when token is missing (undefined)", async () => {
      const req = makeReq(undefined);
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await handleLogOutMobile(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: expect.any(String),
        data: [],
      });
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 when token is an empty string", async () => {
      const req = makeReq("");
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await handleLogOutMobile(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: expect.any(String),
        data: [],
      });
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 when token is not a string", async () => {
      const req = makeReq(12345);
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await handleLogOutMobile(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: expect.any(String),
        data: [],
      });
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ── JWT verification & user lookup ────────────────────────────────────────

  describe("JWT verification and user lookup", () => {
    it("calls next(error) when jwt.verify throws", async () => {
      const jwtError = new Error("invalid signature");
      vi.mocked(jwt.verify).mockImplementationOnce(() => {
        throw jwtError;
      });

      const req = makeReq("bad_refresh_token");
      const { res, status } = mockResponse();
      const next = mockNext();

      await handleLogOutMobile(req, res, next);

      expect(getEnv).toHaveBeenCalledWith("REFRESH_TOKEN_SECRET");
      expect(jwt.verify).toHaveBeenCalledWith(
        "bad_refresh_token",
        "mock_REFRESH_TOKEN_SECRET",
      );
      expect(next).toHaveBeenCalledWith(jwtError);
      expect(status).not.toHaveBeenCalled();
      expect(findUserById).not.toHaveBeenCalled();
    });

    it("returns 401 when user is not found", async () => {
      vi.mocked(jwt.verify).mockReturnValueOnce({ user_id: 99 } as never);
      vi.mocked(findUserById).mockResolvedValueOnce([]);

      const req = makeReq("valid_refresh_token");
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await handleLogOutMobile(req, res, next);

      expect(findUserById).toHaveBeenCalledWith(99);
      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "User not found",
        data: [],
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(updateRefreshToken).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ── Refresh token comparison ──────────────────────────────────────────────

  describe("refresh token comparison", () => {
    it("returns 401 when refresh token does not match stored mobile hash", async () => {
      vi.mocked(jwt.verify).mockReturnValueOnce({ user_id: 10 } as never);
      vi.mocked(findUserById).mockResolvedValueOnce([
        {
          refresh_token_mobile: "hashed_mobile_token",
          refresh_token_web: "hashed_web_token",
        },
      ]);
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);

      const req = makeReq("mismatched_token");
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await handleLogOutMobile(req, res, next);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "mismatched_token",
        "hashed_mobile_token",
      );
      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Invalid token",
        data: [],
      });
      expect(updateRefreshToken).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("clears mobile refresh token and returns 202 on valid logout", async () => {
      vi.mocked(jwt.verify).mockReturnValueOnce({ user_id: 10 } as never);
      vi.mocked(findUserById).mockResolvedValueOnce([
        {
          refresh_token_mobile: "hashed_mobile_token",
          refresh_token_web: "hashed_web_token",
        },
      ]);
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);
      vi.mocked(updateRefreshToken).mockResolvedValueOnce(undefined);

      const req = makeReq("valid_refresh_token");
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await handleLogOutMobile(req, res, next);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "valid_refresh_token",
        "hashed_mobile_token",
      );
      expect(updateRefreshToken).toHaveBeenCalledWith("mobile", null, 10);
      expect(status).toHaveBeenCalledWith(202);
      expect(json).toHaveBeenCalledWith({
        ok: true,
        msg: "Log out success",
        data: [],
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ── Error handling ────────────────────────────────────────────────────────

  describe("error handling", () => {
    it("forwards unexpected database errors to next()", async () => {
      const dbError = new Error("DB failure");
      vi.mocked(jwt.verify).mockReturnValueOnce({ user_id: 10 } as never);
      vi.mocked(findUserById).mockRejectedValueOnce(dbError);

      const req = makeReq("valid_refresh_token");
      const { res, status } = mockResponse();
      const next = mockNext();

      await handleLogOutMobile(req, res, next);

      expect(next).toHaveBeenCalledWith(dbError);
      expect(status).not.toHaveBeenCalled();
    });

    it("forwards updateRefreshToken errors to next()", async () => {
      const dbError = new Error("Update failed");
      vi.mocked(jwt.verify).mockReturnValueOnce({ user_id: 10 } as never);
      vi.mocked(findUserById).mockResolvedValueOnce([
        {
          refresh_token_mobile: "hashed_mobile_token",
          refresh_token_web: "hashed_web_token",
        },
      ]);
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);
      vi.mocked(updateRefreshToken).mockRejectedValueOnce(dbError);

      const req = makeReq("valid_refresh_token");
      const { res, status } = mockResponse();
      const next = mockNext();

      await handleLogOutMobile(req, res, next);

      expect(next).toHaveBeenCalledWith(dbError);
      expect(status).not.toHaveBeenCalled();
    });
  });
});
