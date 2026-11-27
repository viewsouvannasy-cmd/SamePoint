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

vi.mock("../../src/utils/getEnv.js", () => ({
  getEnv: vi.fn((key: string) => `mock_${key}`),
}));

vi.mock("../../src/utils/generate/generateToken.js", () => ({
  generateAccessTokenForMobile: vi.fn(() => "new_mobile_access_token"),
}));

vi.mock("../../src/utils/query/findUser.js", () => ({
  findUserById: vi.fn(),
}));

// --- Imports (after mocks) ---

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getEnv } from "../../src/utils/getEnv.js";
import { generateAccessTokenForMobile } from "../../src/utils/generate/generateToken.js";
import { findUserById } from "../../src/utils/query/findUser.js";
import refreshToken from "../../src/controllers/refresh-token-controller.js";

// --- Helpers ---

const mockResponse = () => {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { res: { status } as unknown as Response, status, json };
};

const mockNext = () => vi.fn() as unknown as NextFunction;

const makeReq = (
  token: unknown,
  params: Record<string, string> = { platform: "mobile" },
): Request => ({ token, params }) as unknown as Request;

// --- Tests ---

describe("refreshToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Validation ────────────────────────────────────────────────────────────

  describe("validation", () => {
    it("returns 401 when token is missing", async () => {
      const req = makeReq(undefined, { platform: "mobile" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await refreshToken(req, res, next);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: expect.any(String),
        data: [],
      });
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 when token is empty", async () => {
      const req = makeReq("", { platform: "mobile" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await refreshToken(req, res, next);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: expect.any(String),
        data: [],
      });
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it("returns 401 when platform is invalid", async () => {
      const req = makeReq("valid_token", { platform: "desktop" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await refreshToken(req, res, next);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: expect.any(String),
        data: [],
      });
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 when platform is missing", async () => {
      const req = makeReq("valid_token", {});
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await refreshToken(req, res, next);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: expect.any(String),
        data: [],
      });
      expect(jwt.verify).not.toHaveBeenCalled();
    });
  });

  // ── Token verification & user lookup ──────────────────────────────────────

  describe("JWT verification and user lookup", () => {
    it("calls next(error) when jwt.verify throws", async () => {
      const jwtError = new Error("jwt malformed");
      vi.mocked(jwt.verify).mockImplementationOnce(() => {
        throw jwtError;
      });

      const req = makeReq("bad_token", { platform: "mobile" });
      const { res, status } = mockResponse();
      const next = mockNext();

      await refreshToken(req, res, next);

      expect(getEnv).toHaveBeenCalledWith("REFRESH_TOKEN_SECRET");
      expect(jwt.verify).toHaveBeenCalledWith(
        "bad_token",
        "mock_REFRESH_TOKEN_SECRET",
      );
      expect(next).toHaveBeenCalledWith(jwtError);
      expect(status).not.toHaveBeenCalled();
      expect(findUserById).not.toHaveBeenCalled();
    });

    it("returns 401 when user is not found", async () => {
      vi.mocked(jwt.verify).mockReturnValueOnce({ user_id: 7 } as never);
      vi.mocked(findUserById).mockResolvedValueOnce([]);

      const req = makeReq("valid_token", { platform: "mobile" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await refreshToken(req, res, next);

      expect(findUserById).toHaveBeenCalledWith(7);
      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "User Is Not Found",
        data: [],
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ── Mobile platform ───────────────────────────────────────────────────────

  describe("mobile platform", () => {
    it("returns 401 when mobile refresh token hash does not match", async () => {
      vi.mocked(jwt.verify).mockReturnValueOnce({ user_id: 7 } as never);
      vi.mocked(findUserById).mockResolvedValueOnce([
        {
          refresh_token_mobile: "hashed_mobile",
          refresh_token_web: "hashed_web",
        },
      ]);
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);

      const req = makeReq("wrong_token", { platform: "mobile" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await refreshToken(req, res, next);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "wrong_token",
        "hashed_mobile",
      );
      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Invalid Token",
        data: [],
      });
      expect(generateAccessTokenForMobile).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("generates a new mobile access token and returns 201 on success", async () => {
      vi.mocked(jwt.verify).mockReturnValueOnce({ user_id: 7 } as never);
      vi.mocked(findUserById).mockResolvedValueOnce([
        {
          refresh_token_mobile: "hashed_mobile",
          refresh_token_web: "hashed_web",
        },
      ]);
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);

      const req = makeReq("valid_mobile_token", { platform: "mobile" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await refreshToken(req, res, next);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "valid_mobile_token",
        "hashed_mobile",
      );
      expect(generateAccessTokenForMobile).toHaveBeenCalledWith(7);
      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({
        ok: true,
        msg: "Generate New Access Token Success",
        data: [{ accessToken: "new_mobile_access_token" }],
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ── Web platform ──────────────────────────────────────────────────────────

  describe("web platform", () => {
    it("compares against refresh_token_web and returns 401 when invalid", async () => {
      vi.mocked(jwt.verify).mockReturnValueOnce({ user_id: 12 } as never);
      vi.mocked(findUserById).mockResolvedValueOnce([
        {
          refresh_token_mobile: "hashed_mobile",
          refresh_token_web: "hashed_web",
        },
      ]);
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);

      const req = makeReq("wrong_web_token", { platform: "web" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await refreshToken(req, res, next);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "wrong_web_token",
        "hashed_web",
      );
      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Invalid Token",
        data: [],
      });
      expect(generateAccessTokenForMobile).not.toHaveBeenCalled();
    });

    it("returns 201 with empty accessToken for web platform", async () => {
      vi.mocked(jwt.verify).mockReturnValueOnce({ user_id: 12 } as never);
      vi.mocked(findUserById).mockResolvedValueOnce([
        {
          refresh_token_mobile: "hashed_mobile",
          refresh_token_web: "hashed_web",
        },
      ]);
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);

      const req = makeReq("valid_web_token", { platform: "web" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await refreshToken(req, res, next);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "valid_web_token",
        "hashed_web",
      );
      expect(generateAccessTokenForMobile).not.toHaveBeenCalled();
      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({
        ok: true,
        msg: "Generate New Access Token Success",
        data: [{ accessToken: "" }],
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ── Error handling ────────────────────────────────────────────────────────

  describe("error handling", () => {
    it("calls next(error) when findUserById rejects", async () => {
      const dbError = new Error("DB error");
      vi.mocked(jwt.verify).mockReturnValueOnce({ user_id: 7 } as never);
      vi.mocked(findUserById).mockRejectedValueOnce(dbError);

      const req = makeReq("valid_token", { platform: "mobile" });
      const { res, status } = mockResponse();
      const next = mockNext();

      await refreshToken(req, res, next);

      expect(next).toHaveBeenCalledWith(dbError);
      expect(status).not.toHaveBeenCalled();
    });
  });
});
