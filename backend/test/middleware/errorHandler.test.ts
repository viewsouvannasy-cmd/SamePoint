import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { NextFunction, Request, Response } from "express";

// --- Mocks ---

vi.mock("../../src/utils/getEnv.js", () => ({
  getEnv: vi.fn(),
}));

// --- Imports (after mocks) ---

import { getEnv } from "../../src/utils/getEnv.js";
import errorHandler from "../../src/middlewares/errorHandler.js";

// --- Helpers ---

const mockResponse = () => {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { res: { status } as unknown as Response, status, json };
};

// --- Tests ---

describe("errorHandler", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("logs the error and returns the raw error as msg in development", () => {
    vi.mocked(getEnv).mockReturnValueOnce("development");
    const err = new Error("Something broke");
    const req = {} as Request;
    const { res, status, json } = mockResponse();
    const next = vi.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(consoleSpy).toHaveBeenCalledWith(err);
    expect(getEnv).toHaveBeenCalledWith("NODE_ENV");
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      ok: false,
      msg: err,
      data: [],
    });
  });

  it("returns generic Internal Server Error outside development", () => {
    vi.mocked(getEnv).mockReturnValueOnce("production");
    const err = new Error("Sensitive DB failure");
    const req = {} as Request;
    const { res, status, json } = mockResponse();
    const next = vi.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(consoleSpy).toHaveBeenCalledWith(err);
    expect(getEnv).toHaveBeenCalledWith("NODE_ENV");
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      ok: false,
      msg: "Internal Server Error",
      data: [],
    });
  });
});
