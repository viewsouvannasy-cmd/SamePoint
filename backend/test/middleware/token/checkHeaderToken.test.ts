import { describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";

import "../../../src/types/express.d.ts";

import checkHeaderToken from "../../../src/middlewares/token/checkHeaderToken";

const mockResponse = () => {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { res: { status } as unknown as Response, status, json };
};

describe("checkHeaderToken", () => {
  it("returns 400 when the authorization header is missing", () => {
    const req = { headers: {} } as Request;
    const { res, status, json } = mockResponse();
    const next = vi.fn() as NextFunction;

    checkHeaderToken(req, res, next);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      ok: false,
      msg: "Header Should Not Empty",
      data: [],
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when the scheme is not Bearer", () => {
    const req = { headers: { authorization: "Basic abc" } } as Request;
    const { res, status, json } = mockResponse();
    const next = vi.fn() as NextFunction;

    checkHeaderToken(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      ok: false,
      msg: "Invalid Authorization Header",
      data: [],
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when Bearer has no token", () => {
    const req = { headers: { authorization: "Bearer" } } as Request;
    const { res, status, json } = mockResponse();
    const next = vi.fn() as NextFunction;

    checkHeaderToken(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      ok: false,
      msg: "Invalid Authorization Header",
      data: [],
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("sets req.token and calls next for a valid Bearer token", () => {
    const req = {
      headers: { authorization: "Bearer access-token" },
    } as Request;
    const { res, status } = mockResponse();
    const next = vi.fn() as NextFunction;

    checkHeaderToken(req, res, next);

    expect(req.token).toBe("access-token");
    expect(next).toHaveBeenCalledOnce();
    expect(status).not.toHaveBeenCalled();
  });
});
