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
}));

vi.mock("../../../../src/utils/query/update.js", () => ({
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

import bcrypt from "bcrypt";
import client from "../../../../src/configs/google-client.js";
import {
  findUserByEmail,
  createNewUser,
} from "../../../../src/controllers/oauth/oauth-query.js";
import { updateRefreshToken } from "../../../../src/utils/query/update.js";
import { generateUserSeed } from "../../../../src/utils/generate/generate.js";
import {
  generateAccessTokenForMobile,
  generateRefreshTokenForMobile,
} from "../../../../src/utils/generate/generateToken.js";
import { googleResigterMobile } from "../../../../src/controllers/oauth/oauth-controller-mobile.js";

// --- Helpers ---

const mockResponse = () => {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { res: { status } as unknown as Response, status, json };
};

const mockNext = () => vi.fn() as unknown as NextFunction;

const makeReq = (token: unknown): Request => ({ token }) as unknown as Request;

const makeTicket = (payload: object | null | undefined) => ({
  getPayload: vi.fn(() => payload),
});

// --- Tests ---

describe("googleResigterMobile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Token validation ──────────────────────────────────────────────────────

  describe("token validation", () => {
    it("returns 400 when token is missing (undefined)", async () => {
      const req = makeReq(undefined);
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await googleResigterMobile(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: expect.any(String),
        data: [],
      });
      expect(client.verifyIdToken).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 when token is an empty string", async () => {
      const req = makeReq("");
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await googleResigterMobile(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: expect.any(String),
        data: [],
      });
      expect(client.verifyIdToken).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 when token is not a string", async () => {
      const req = makeReq(12345);
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await googleResigterMobile(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: expect.any(String),
        data: [],
      });
      expect(client.verifyIdToken).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ── Google token verification ─────────────────────────────────────────────

  describe("Google token verification", () => {
    it("verifies token against web and iOS client audiences", async () => {
      vi.mocked(client.verifyIdToken).mockResolvedValueOnce(
        makeTicket(null) as never,
      );

      const req = makeReq("valid_token");
      const { res } = mockResponse();

      await googleResigterMobile(req, res, mockNext());

      expect(client.verifyIdToken).toHaveBeenCalledWith({
        idToken: "valid_token",
        audience: ["mock_GOOGLE_CLIENT_WEB_ID", "mock_GOOGLE_CLIENT_IOS_ID"],
      });
    });

    it("returns 400 when getPayload() returns null", async () => {
      vi.mocked(client.verifyIdToken).mockResolvedValueOnce(
        makeTicket(null) as never,
      );

      const req = makeReq("valid_token");
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await googleResigterMobile(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Invalid Email",
        data: [],
      });
      expect(findUserByEmail).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 when payload has no email", async () => {
      vi.mocked(client.verifyIdToken).mockResolvedValueOnce(
        makeTicket({ name: "No Email User" }) as never,
      );

      const req = makeReq("valid_token");
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await googleResigterMobile(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Invalid Email",
        data: [],
      });
      expect(findUserByEmail).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 when payload email is an empty string", async () => {
      vi.mocked(client.verifyIdToken).mockResolvedValueOnce(
        makeTicket({ email: "", name: "Empty Email" }) as never,
      );

      const req = makeReq("valid_token");
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await googleResigterMobile(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Invalid Email",
        data: [],
      });
      expect(findUserByEmail).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ── Existing user (login flow) ────────────────────────────────────────────

  describe("when user already exists (login flow)", () => {
    it("returns 200 with tokens and 'LogIn With Google Success' message", async () => {
      vi.mocked(client.verifyIdToken).mockResolvedValueOnce(
        makeTicket({
          email: "existing@example.com",
          name: "Existing User",
        }) as never,
      );
      vi.mocked(findUserByEmail).mockResolvedValueOnce([
        { user_id: 123 },
      ] as never);

      const req = makeReq("valid_token");
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await googleResigterMobile(req, res, next);

      expect(findUserByEmail).toHaveBeenCalledWith("existing@example.com");
      expect(createNewUser).not.toHaveBeenCalled();
      expect(generateUserSeed).not.toHaveBeenCalled();
      expect(generateAccessTokenForMobile).toHaveBeenCalledWith(123);
      expect(generateRefreshTokenForMobile).toHaveBeenCalledWith(123);
      expect(bcrypt.hash).toHaveBeenCalledWith("mock_refresh_token", 10);
      expect(updateRefreshToken).toHaveBeenCalledWith(
        "mobile",
        "mock_hashed_refresh_token",
        123,
      );
      expect(status).toHaveBeenCalledWith(200);
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
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ── New user (register flow) ──────────────────────────────────────────────

  describe("when user does not exist (register flow)", () => {
    it("creates a new user and returns 201 with 'SignIn With Google Success' message", async () => {
      vi.mocked(client.verifyIdToken).mockResolvedValueOnce(
        makeTicket({ email: "new@example.com", name: "New User" }) as never,
      );
      vi.mocked(findUserByEmail).mockResolvedValueOnce([] as never);
      vi.mocked(createNewUser).mockResolvedValueOnce([
        { user_id: 456 },
      ] as never);

      const req = makeReq("valid_token");
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await googleResigterMobile(req, res, next);

      expect(generateUserSeed).toHaveBeenCalledWith("New User");
      expect(createNewUser).toHaveBeenCalledWith({
        user_name: "New User",
        user_email: "new@example.com",
        avatar_seed: "mock_seed",
        is_active: true,
        provider: "google",
      });
      expect(generateAccessTokenForMobile).toHaveBeenCalledWith(456);
      expect(generateRefreshTokenForMobile).toHaveBeenCalledWith(456);
      expect(bcrypt.hash).toHaveBeenCalledWith("mock_refresh_token", 10);
      expect(updateRefreshToken).toHaveBeenCalledWith(
        "mobile",
        "mock_hashed_refresh_token",
        456,
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
      expect(next).not.toHaveBeenCalled();
    });

    it("derives username from email prefix when payload.name is missing", async () => {
      vi.mocked(client.verifyIdToken).mockResolvedValueOnce(
        makeTicket({ email: "john.doe@example.com" }) as never,
      );
      vi.mocked(findUserByEmail).mockResolvedValueOnce([] as never);
      vi.mocked(createNewUser).mockResolvedValueOnce([
        { user_id: 789 },
      ] as never);

      const req = makeReq("valid_token");
      const { res, status } = mockResponse();

      await googleResigterMobile(req, res, mockNext());

      expect(generateUserSeed).toHaveBeenCalledWith("john.doe");
      expect(createNewUser).toHaveBeenCalledWith(
        expect.objectContaining({ user_name: "john.doe" }),
      );
      expect(status).toHaveBeenCalledWith(201);
    });

    it("derives username from email prefix when payload.name is empty", async () => {
      vi.mocked(client.verifyIdToken).mockResolvedValueOnce(
        makeTicket({ email: "jane.smith@example.com", name: "" }) as never,
      );
      vi.mocked(findUserByEmail).mockResolvedValueOnce([] as never);
      vi.mocked(createNewUser).mockResolvedValueOnce([
        { user_id: 790 },
      ] as never);

      const req = makeReq("valid_token");
      const { res, status } = mockResponse();

      await googleResigterMobile(req, res, mockNext());

      expect(generateUserSeed).toHaveBeenCalledWith("jane.smith");
      expect(createNewUser).toHaveBeenCalledWith(
        expect.objectContaining({ user_name: "jane.smith" }),
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

    it("calls next(error) when bcrypt.hash throws", async () => {
      const error = new Error("Hashing failed");
      vi.mocked(client.verifyIdToken).mockResolvedValueOnce(
        makeTicket({ email: "existing@example.com", name: "User" }) as never,
      );
      vi.mocked(findUserByEmail).mockResolvedValueOnce([
        { user_id: 123 },
      ] as never);
      vi.mocked(bcrypt.hash).mockRejectedValueOnce(error as never);

      const req = makeReq("valid_token");
      const { res } = mockResponse();
      const next = mockNext();

      await googleResigterMobile(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it("calls next(error) when updateRefreshToken throws", async () => {
      const error = new Error("Update refresh token failed");
      vi.mocked(client.verifyIdToken).mockResolvedValueOnce(
        makeTicket({ email: "existing@example.com", name: "User" }) as never,
      );
      vi.mocked(findUserByEmail).mockResolvedValueOnce([
        { user_id: 123 },
      ] as never);
      vi.mocked(updateRefreshToken).mockRejectedValueOnce(error);

      const req = makeReq("valid_token");
      const { res } = mockResponse();
      const next = mockNext();

      await googleResigterMobile(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
