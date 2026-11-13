import { describe, expect, it, vi, beforeEach } from "vitest";
import type { NextFunction, Request, Response } from "express";

// --- Mocks ---

vi.mock("../../../../src/configs/google-client.js", () => ({
  default: { verifyIdToken: vi.fn() },
}));

vi.mock("../../../../src/utils/getEnv.js", () => ({
  getEnv: vi.fn((key: string) => `mock_${key}`),
}));

vi.mock("../../../../src/controllers/oauth/oauth-query.js", () => ({
  findUserByEmail: vi.fn(),
  createNewUser: vi.fn(),
  updateRefreshToken: vi.fn(),
}));

vi.mock("../../../../src/utils/generate/generate.js", () => ({
  generateUserSeed: vi.fn(() => "mock_seed"),
}));

vi.mock("../../../../src/utils/generate/generateToken.js", () => ({
  generateAccessTokenForMobile: vi.fn(() => "mock_access_token"),
  generateRefreshTokenForMobile: vi.fn(() => "mock_refresh_token"),
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(() => "mock_hashed_refresh_token"),
  },
}));

// --- Imports (after mocks) ---

import client from "../../../../src/configs/google-client.js";
import {
  findUserByEmail,
  createNewUser,
  updateRefreshToken,
} from "../../../../src/controllers/oauth/oauth-query.js";
import { googleResigterMobile } from "../../../../src/controllers/oauth/oauth-controller-mobile.js";

// --- Helpers ---

const mockResponse = () => {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { res: { status } as unknown as Response, status, json };
};

const mockNext = () => vi.fn() as unknown as NextFunction;

const makeReq = (token: unknown): Request => ({ token }) as unknown as Request;

const makeTicket = (payload: object | null) => ({
  getPayload: vi.fn(() => payload),
});

// --- Tests ---

describe("googleResigterMobile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Validation ────────────────────────────────────────────────────────────

  describe("token validation", () => {
    it("returns 400 when token is missing (undefined)", async () => {
      const req = makeReq(undefined);
      const { res, status, json } = mockResponse();

      await googleResigterMobile(req, res, mockNext());

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ ok: false }));
    });

    it("returns 400 when token is an empty string", async () => {
      const req = makeReq("");
      const { res, status, json } = mockResponse();

      await googleResigterMobile(req, res, mockNext());

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ ok: false }));
    });
  });

  // ── Google payload ────────────────────────────────────────────────────────

  describe("Google token verification", () => {
    it("returns 400 when getPayload() returns null", async () => {
      vi.mocked(client.verifyIdToken).mockResolvedValueOnce(
        makeTicket(null) as never,
      );

      const req = makeReq("valid_token");
      const { res, status, json } = mockResponse();

      await googleResigterMobile(req, res, mockNext());

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Invalid Email",
        data: [],
      });
    });

    it("returns 400 when payload has no email", async () => {
      vi.mocked(client.verifyIdToken).mockResolvedValueOnce(
        makeTicket({ name: "No Email User" }) as never,
      );

      const req = makeReq("valid_token");
      const { res, status, json } = mockResponse();

      await googleResigterMobile(req, res, mockNext());

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Invalid Email",
        data: [],
      });
    });
  });

  // ── Existing user (login) ─────────────────────────────────────────────────

  describe("when user already exists (login flow)", () => {
    it("returns 201 with tokens and 'LogIn With Google Success' message", async () => {
      vi.mocked(client.verifyIdToken).mockResolvedValueOnce(
        makeTicket({
          email: "existing@example.com",
          name: "Existing User",
        }) as never,
      );
      vi.mocked(findUserByEmail).mockResolvedValueOnce([
        { user_id: "user-123" },
      ] as never);

      const req = makeReq("valid_token");
      const { res, status, json } = mockResponse();

      await googleResigterMobile(req, res, mockNext());

      expect(updateRefreshToken).toHaveBeenCalledWith(
        "mobile",
        "mock_hashed_refresh_token",
        "user-123",
      );
      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({
        ok: true,
        msg: "LogIn With Google Success",
        data: [
          {
            accessToken: "mock_access_token",
            refreshToken: "mock_refresh_token",
          },
        ],
      });
    });
  });

  // ── New user (register) ───────────────────────────────────────────────────

  describe("when user does not exist (register flow)", () => {
    it("creates a new user and returns 201 with 'SignIn With Google Success' message", async () => {
      vi.mocked(client.verifyIdToken).mockResolvedValueOnce(
        makeTicket({ email: "new@example.com", name: "New User" }) as never,
      );
      vi.mocked(findUserByEmail).mockResolvedValueOnce([] as never);
      vi.mocked(createNewUser).mockResolvedValueOnce([
        { user_id: "user-456" },
      ] as never);

      const req = makeReq("valid_token");
      const { res, status, json } = mockResponse();

      await googleResigterMobile(req, res, mockNext());

      expect(createNewUser).toHaveBeenCalledWith({
        user_name: "New User",
        user_email: "new@example.com",
        avatar_seed: "mock_seed",
        is_active: true,
        provider: "google",
      });
      expect(updateRefreshToken).toHaveBeenCalledWith(
        "mobile",
        "mock_hashed_refresh_token",
        "user-456",
      );
      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({
        ok: true,
        msg: "SignIn With Google Success",
        data: [
          {
            accessToken: "mock_access_token",
            refreshToken: "mock_refresh_token",
          },
        ],
      });
    });

    it("derives username from email prefix when payload.name is missing", async () => {
      vi.mocked(client.verifyIdToken).mockResolvedValueOnce(
        makeTicket({ email: "john.doe@example.com" }) as never,
      );
      vi.mocked(findUserByEmail).mockResolvedValueOnce([] as never);
      vi.mocked(createNewUser).mockResolvedValueOnce([
        { user_id: "user-789" },
      ] as never);

      const req = makeReq("valid_token");
      const { res, status } = mockResponse();

      await googleResigterMobile(req, res, mockNext());

      expect(createNewUser).toHaveBeenCalledWith(
        expect.objectContaining({ user_name: "john.doe" }),
      );
      expect(status).toHaveBeenCalledWith(201);
    });
  });

  // ── Error handling ────────────────────────────────────────────────────────

  describe("error handling", () => {
    it("calls next(error) when verifyIdToken throws", async () => {
      const error = new Error("Google API error");
      vi.mocked(client.verifyIdToken).mockRejectedValueOnce(error);

      const req = makeReq("valid_token");
      const { res } = mockResponse();
      const next = mockNext();

      await googleResigterMobile(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it("calls next(error) when findUserByEmail throws", async () => {
      const error = new Error("DB error");
      vi.mocked(client.verifyIdToken).mockResolvedValueOnce(
        makeTicket({ email: "user@example.com", name: "User" }) as never,
      );
      vi.mocked(findUserByEmail).mockRejectedValueOnce(error);

      const req = makeReq("valid_token");
      const { res } = mockResponse();
      const next = mockNext();

      await googleResigterMobile(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it("calls next(error) when createNewUser throws", async () => {
      const error = new Error("Insert failed");
      vi.mocked(client.verifyIdToken).mockResolvedValueOnce(
        makeTicket({ email: "new@example.com", name: "New User" }) as never,
      );
      vi.mocked(findUserByEmail).mockResolvedValueOnce([] as never);
      vi.mocked(createNewUser).mockRejectedValueOnce(error);

      const req = makeReq("valid_token");
      const { res } = mockResponse();
      const next = mockNext();

      await googleResigterMobile(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
