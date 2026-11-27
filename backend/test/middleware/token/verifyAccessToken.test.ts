import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

import verifyAccessToken from "../../../src/middlewares/token/verifyAccessToken.js";

// --- Helpers ---

const mockResponse = () => {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { res: { status } as unknown as Response, status, json };
};

const mockNext = () => vi.fn() as unknown as NextFunction;

// --- Tests ---

describe("verifyAccessToken", () => {
  const secret = process.env.ACCESS_TOKEN_SECRET ?? "test-access-secret";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Header and token presence ─────────────────────────────────────────────

  describe("header and token presence", () => {
    it("returns 401 when authorization header is missing", () => {
      const req = { headers: {} } as Request;
      const { res, status, json } = mockResponse();
      const next = mockNext();

      verifyAccessToken(req, res, next);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok_verify_token: false,
        msg: "no have token provided",
        data: "",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 TOKEN_MISSING when Bearer has no token", () => {
      const req = { headers: { authorization: "Bearer" } } as Request;
      const { res, status, json } = mockResponse();
      const next = mockNext();

      verifyAccessToken(req, res, next);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok_verify_token: false,
        msg: "TOKEN_MISSING",
        data: "",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 TOKEN_MISSING when token is "null"', () => {
      const req = { headers: { authorization: "Bearer null" } } as Request;
      const { res, status, json } = mockResponse();
      const next = mockNext();

      verifyAccessToken(req, res, next);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok_verify_token: false,
        msg: "TOKEN_MISSING",
        data: "",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 TOKEN_MISSING when token is "undefined"', () => {
      const req = { headers: { authorization: "Bearer undefined" } } as Request;
      const { res, status, json } = mockResponse();
      const next = mockNext();

      verifyAccessToken(req, res, next);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok_verify_token: false,
        msg: "TOKEN_MISSING",
        data: "",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ── JWT verification ──────────────────────────────────────────────────────

  describe("JWT verification", () => {
    it("attaches user_id to req.body while preserving existing fields and calls next", () => {
      const token = jwt.sign({ user_id: 42 }, secret, { expiresIn: "5m" });
      const req = {
        headers: { authorization: `Bearer ${token}` },
        body: { project_name: "Alpha" },
      } as Request;
      const { res, status } = mockResponse();
      const next = mockNext();

      verifyAccessToken(req, res, next);

      expect(req.body).toEqual({
        project_name: "Alpha",
        user_id: 42,
      });
      expect(next).toHaveBeenCalledOnce();
      expect(next).toHaveBeenCalledWith();
      expect(status).not.toHaveBeenCalled();
    });

    it("creates req.body with user_id when req.body is initially undefined", () => {
      const token = jwt.sign({ user_id: 7 }, secret, { expiresIn: "5m" });
      const req = {
        headers: { authorization: `Bearer ${token}` },
      } as Request;
      const { res } = mockResponse();
      const next = mockNext();

      verifyAccessToken(req, res, next);

      expect(req.body).toEqual({ user_id: 7 });
      expect(next).toHaveBeenCalledOnce();
    });

    it("returns 401 TOKEN_EXPIRED when token is expired", () => {
      const token = jwt.sign({ user_id: 42 }, secret, { expiresIn: -10 });
      const req = {
        headers: { authorization: `Bearer ${token}` },
      } as Request;
      const { res, status, json } = mockResponse();
      const next = mockNext();

      verifyAccessToken(req, res, next);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok_verify_token: false,
        msg: "TOKEN_EXPIRED",
        data: "",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 TOKEN_INVALID when token signature is invalid", () => {
      const token = jwt.sign({ user_id: 42 }, "wrong-secret", {
        expiresIn: "5m",
      });
      const req = {
        headers: { authorization: `Bearer ${token}` },
      } as Request;
      const { res, status, json } = mockResponse();
      const next = mockNext();

      verifyAccessToken(req, res, next);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok_verify_token: false,
        msg: "TOKEN_INVALID",
        data: "",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 TOKEN_INVALID when token is malformed", () => {
      const req = {
        headers: { authorization: "Bearer not-a-jwt" },
      } as Request;
      const { res, status, json } = mockResponse();
      const next = mockNext();

      verifyAccessToken(req, res, next);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok_verify_token: false,
        msg: "TOKEN_INVALID",
        data: "",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("forwards non-JWT errors to next(error)", () => {
      const unexpectedError = new Error("getEnv failure");
      vi.spyOn(jwt, "verify").mockImplementationOnce(() => {
        throw unexpectedError;
      });

      const req = {
        headers: { authorization: "Bearer some.token.value" },
      } as Request;
      const { res, status } = mockResponse();
      const next = mockNext();

      verifyAccessToken(req, res, next);

      expect(next).toHaveBeenCalledWith(unexpectedError);
      expect(status).not.toHaveBeenCalled();
    });
  });
});
