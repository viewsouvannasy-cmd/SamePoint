import { describe, expect, it, vi, beforeEach } from "vitest";
import type { NextFunction, Request, Response } from "express";

// --- Mocks ---

vi.mock("../../../../src/utils/query/findUser.js", () => ({
  findUserById: vi.fn(),
}));

vi.mock("../../../../src/utils/getEnv.js", () => ({
  getEnv: vi.fn(() => "mock_secret"),
}));

vi.mock("../../../../src/utils/generate/generateToken.js", () => ({
  generateAccessTokenForMobile: vi.fn(() => "mock_access_token"),
}));

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

// --- Imports (after mocks) ---

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { findUserById } from "../../../../src/utils/query/findUser.js";
import { isUserLogin } from "../../../../src/controllers/auth/auth-controller-mobile.js";

// --- Helpers ---

const mockResponse = () => {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { res: { status } as unknown as Response, status, json };
};

const mockNext = () => vi.fn() as unknown as NextFunction;

const makeReq = (token: unknown): Request =>
  ({ token } as unknown as Request);

const mockUser = (overrides = {}) => ({
  user_id: "user-123",
  refresh_token_mobile: "hashed_refresh_token",
  ...overrides,
});

// --- Tests ---

describe("isUserLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Token validation ──────────────────────────────────────────────────────

  describe("token validation", () => {
    it("returns 400 when token is missing (undefined)", async () => {
      const req = makeReq(undefined);
      const { res, status, json } = mockResponse();

      await isUserLogin(req, res, mockNext());

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ ok: false })
      );
    });

    it("returns 400 when token is an empty string", async () => {
      const req = makeReq("");
      const { res, status, json } = mockResponse();

      await isUserLogin(req, res, mockNext());

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ ok: false })
      );
    });
  });

  // ── JWT verification ──────────────────────────────────────────────────────

  describe("JWT verification", () => {
    it("returns 401 when jwt.verify throws (invalid/expired token)", async () => {
      vi.mocked(jwt.verify).mockImplementationOnce(() => {
        throw new Error("invalid token");
      });

      const req = makeReq("bad_token");
      const { res, status, json } = mockResponse();

      await isUserLogin(req, res, mockNext());

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Token Invalid",
        data: [],
      });
    });
  });

  // ── User lookup ───────────────────────────────────────────────────────────

  describe("user lookup", () => {
    it("returns 401 when user is not found in the database", async () => {
      vi.mocked(jwt.verify).mockReturnValueOnce(
        { user_id: "user-123" } as never
      );
      vi.mocked(findUserById).mockResolvedValueOnce([] as never);

      const req = makeReq("valid_token");
      const { res, status, json } = mockResponse();

      await isUserLogin(req, res, mockNext());

      expect(findUserById).toHaveBeenCalledWith("user-123");
      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "User Is Not Found",
        data: [],
      });
    });
  });

  // ── Refresh token comparison ──────────────────────────────────────────────

  describe("refresh token comparison", () => {
    it("returns 401 when refresh token does not match", async () => {
      vi.mocked(jwt.verify).mockReturnValueOnce(
        { user_id: "user-123" } as never
      );
      vi.mocked(findUserById).mockResolvedValueOnce([mockUser()] as never);
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);

      const req = makeReq("valid_token");
      const { res, status, json } = mockResponse();

      await isUserLogin(req, res, mockNext());

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "valid_token",
        "hashed_refresh_token"
      );
      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Token Invalid",
        data: [],
      });
    });
  });

  // ── Success ───────────────────────────────────────────────────────────────

  describe("success", () => {
    it("returns 200 with a new access token when everything is valid", async () => {
      vi.mocked(jwt.verify).mockReturnValueOnce(
        { user_id: "user-123" } as never
      );
      vi.mocked(findUserById).mockResolvedValueOnce([mockUser()] as never);
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);

      const req = makeReq("valid_token");
      const { res, status, json } = mockResponse();

      await isUserLogin(req, res, mockNext());

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        ok: true,
        msg: "User Is Login",
        data: [{ accessToken: "mock_access_token" }],
      });
    });
  });

  // ── Error handling ────────────────────────────────────────────────────────

  describe("error handling", () => {
    it("calls next(error) when findUserById throws", async () => {
      const error = new Error("DB error");
      vi.mocked(jwt.verify).mockReturnValueOnce(
        { user_id: "user-123" } as never
      );
      vi.mocked(findUserById).mockRejectedValueOnce(error);

      const req = makeReq("valid_token");
      const { res } = mockResponse();
      const next = mockNext();

      await isUserLogin(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it("calls next(error) when bcrypt.compare throws", async () => {
      const error = new Error("bcrypt error");
      vi.mocked(jwt.verify).mockReturnValueOnce(
        { user_id: "user-123" } as never
      );
      vi.mocked(findUserById).mockResolvedValueOnce([mockUser()] as never);
      vi.mocked(bcrypt.compare).mockRejectedValueOnce(error);

      const req = makeReq("valid_token");
      const { res } = mockResponse();
      const next = mockNext();

      await isUserLogin(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});

