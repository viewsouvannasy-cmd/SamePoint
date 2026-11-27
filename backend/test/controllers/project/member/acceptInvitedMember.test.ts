import { describe, expect, it, vi, beforeEach } from "vitest";
import type { NextFunction, Request, Response } from "express";

// --- Mocks ---

vi.mock("../../../../src/controllers/project/member/member-query.js", () => ({
  writeNewMember: vi.fn(),
}));

// --- Imports (after mocks) ---

import { writeNewMember } from "../../../../src/controllers/project/member/member-query.js";
import { acceptInvitedMember } from "../../../../src/controllers/project/member/member-controller.js";

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

describe("acceptInvitedMember", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Validation ────────────────────────────────────────────────────────────

  describe("validation", () => {
    it("returns 400 when user_id is missing", async () => {
      const req = makeReq({ p_id: 1, position: "Developer" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await acceptInvitedMember(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: expect.any(String),
        data: [],
      });
      expect(writeNewMember).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 when user_id is not a positive integer", async () => {
      const req = makeReq({ user_id: 0, p_id: 1, position: "Developer" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await acceptInvitedMember(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Invalid id",
        data: [],
      });
      expect(writeNewMember).not.toHaveBeenCalled();
    });

    it("returns 400 when p_id is missing", async () => {
      const req = makeReq({ user_id: 1, position: "Developer" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await acceptInvitedMember(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: expect.any(String),
        data: [],
      });
      expect(writeNewMember).not.toHaveBeenCalled();
    });

    it("returns 400 when p_id is not a positive integer", async () => {
      const req = makeReq({ user_id: 1, p_id: -3, position: "Developer" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await acceptInvitedMember(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Invalid id",
        data: [],
      });
      expect(writeNewMember).not.toHaveBeenCalled();
    });

    it("returns 400 when position is missing", async () => {
      const req = makeReq({ user_id: 1, p_id: 2 });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await acceptInvitedMember(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Position must be a string",
        data: [],
      });
      expect(writeNewMember).not.toHaveBeenCalled();
    });

    it("returns 400 when position is empty or whitespace only", async () => {
      const req = makeReq({ user_id: 1, p_id: 2, position: "   " });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await acceptInvitedMember(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Position cannot be empty",
        data: [],
      });
      expect(writeNewMember).not.toHaveBeenCalled();
    });

    it("returns 400 when position exceeds 100 characters", async () => {
      const req = makeReq({
        user_id: 1,
        p_id: 2,
        position: "P".repeat(101),
      });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await acceptInvitedMember(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Position must be at most 100 characters",
        data: [],
      });
      expect(writeNewMember).not.toHaveBeenCalled();
    });
  });

  // ── Success ───────────────────────────────────────────────────────────────

  describe("success", () => {
    it("creates a non-owner member with trimmed position and returns 201", async () => {
      vi.mocked(writeNewMember).mockResolvedValueOnce(undefined);

      const req = makeReq({
        user_id: 5,
        p_id: 12,
        position: "  Frontend Developer  ",
      });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await acceptInvitedMember(req, res, next);

      expect(writeNewMember).toHaveBeenCalledWith(
        12,
        5,
        "Frontend Developer",
        false,
      );
      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({
        ok: true,
        msg: "You accept invited",
        data: [],
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ── Error handling ────────────────────────────────────────────────────────

  describe("error handling", () => {
    it("forwards unexpected errors to next()", async () => {
      const dbError = new Error("Insert failed");
      vi.mocked(writeNewMember).mockRejectedValueOnce(dbError);

      const req = makeReq({ user_id: 5, p_id: 12, position: "QA" });
      const { res, status } = mockResponse();
      const next = mockNext();

      await acceptInvitedMember(req, res, next);

      expect(next).toHaveBeenCalledWith(dbError);
      expect(status).not.toHaveBeenCalled();
    });
  });
});
