import { describe, expect, it, vi, beforeEach } from "vitest";
import type { NextFunction, Request, Response } from "express";

// --- Mocks ---

vi.mock("../../../src/controllers/project/project-query.js", () => ({
  writeUpdateArchiveProject: vi.fn(),
}));

vi.mock("../../../src/utils/query/checkValid.js", () => ({
  isUserMember: vi.fn(),
}));

// --- Imports (after mocks) ---

import { writeUpdateArchiveProject } from "../../../src/controllers/project/project-query.js";
import { isUserMember } from "../../../src/utils/query/checkValid.js";
import { switchArchiveProject } from "../../../src/controllers/project/project-controller.js";

// --- Helpers ---

const mockResponse = () => {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { res: { status } as unknown as Response, status, json };
};

const mockNext = () => vi.fn() as unknown as NextFunction;

const makeReq = (
  body: unknown,
  params: Record<string, string> = { p_id: "1" },
): Request => ({ body, params } as unknown as Request);

// --- Tests ---

describe("switchArchiveProject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Validation ────────────────────────────────────────────────────────────

  describe("Validation", () => {
    it("returns 400 when user_id is missing", async () => {
      const req = makeReq({ archive: true });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await switchArchiveProject(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: expect.any(String),
        data: [],
      });
      expect(isUserMember).not.toHaveBeenCalled();
      expect(writeUpdateArchiveProject).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 when user_id is not a positive integer", async () => {
      const req = makeReq({ user_id: -1, archive: true });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await switchArchiveProject(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Invalid id",
        data: [],
      });
      expect(isUserMember).not.toHaveBeenCalled();
    });

    it("returns 400 when archive is missing", async () => {
      const req = makeReq({ user_id: 1 });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await switchArchiveProject(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: expect.any(String),
        data: [],
      });
      expect(isUserMember).not.toHaveBeenCalled();
    });

    it("returns 400 when archive is not a boolean", async () => {
      const req = makeReq({ user_id: 1, archive: "true" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await switchArchiveProject(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: expect.any(String),
        data: [],
      });
      expect(isUserMember).not.toHaveBeenCalled();
    });
  });

  // ── Authorization / Membership ────────────────────────────────────────────

  describe("Authorization", () => {
    it("returns 401 when the user is not a member of the project", async () => {
      const req = makeReq(
        { user_id: 2, archive: true },
        { p_id: "15" },
      );
      const { res, status, json } = mockResponse();
      const next = mockNext();

      vi.mocked(isUserMember).mockResolvedValueOnce(undefined);

      await switchArchiveProject(req, res, next);

      expect(isUserMember).toHaveBeenCalledWith(15, 2);
      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "You are not a member",
        data: [],
      });
      expect(writeUpdateArchiveProject).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ── Success Cases ─────────────────────────────────────────────────────────

  describe("Success", () => {
    it("switches archive to true successfully and returns 202 when user is a member", async () => {
      const req = makeReq(
        { user_id: 3, archive: true },
        { p_id: "20" },
      );
      const { res, status, json } = mockResponse();
      const next = mockNext();

      vi.mocked(isUserMember).mockResolvedValueOnce({ m_id: 101 });
      vi.mocked(writeUpdateArchiveProject).mockResolvedValueOnce();

      await switchArchiveProject(req, res, next);

      expect(isUserMember).toHaveBeenCalledWith(20, 3);
      expect(writeUpdateArchiveProject).toHaveBeenCalledWith(101, true);
      expect(status).toHaveBeenCalledWith(202);
      expect(json).toHaveBeenCalledWith({
        ok: true,
        msg: "Switch archive success",
        data: [],
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("switches archive to false successfully and returns 202", async () => {
      const req = makeReq(
        { user_id: 4, archive: false },
        { p_id: "35" },
      );
      const { res, status, json } = mockResponse();
      const next = mockNext();

      vi.mocked(isUserMember).mockResolvedValueOnce({ m_id: 202 });
      vi.mocked(writeUpdateArchiveProject).mockResolvedValueOnce();

      await switchArchiveProject(req, res, next);

      expect(isUserMember).toHaveBeenCalledWith(35, 4);
      expect(writeUpdateArchiveProject).toHaveBeenCalledWith(202, false);
      expect(status).toHaveBeenCalledWith(202);
      expect(json).toHaveBeenCalledWith({
        ok: true,
        msg: "Switch archive success",
        data: [],
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ── Error Handling ────────────────────────────────────────────────────────

  describe("Error handling", () => {
    it("calls next with error when isUserMember throws", async () => {
      const req = makeReq(
        { user_id: 1, archive: true },
        { p_id: "10" },
      );
      const { res, status } = mockResponse();
      const next = mockNext();
      const dbError = new Error("Database error while checking membership");

      vi.mocked(isUserMember).mockRejectedValueOnce(dbError);

      await switchArchiveProject(req, res, next);

      expect(next).toHaveBeenCalledWith(dbError);
      expect(writeUpdateArchiveProject).not.toHaveBeenCalled();
      expect(status).not.toHaveBeenCalled();
    });

    it("calls next with error when writeUpdateArchiveProject throws", async () => {
      const req = makeReq(
        { user_id: 1, archive: true },
        { p_id: "10" },
      );
      const { res, status } = mockResponse();
      const next = mockNext();
      const dbError = new Error("Database error while updating archive status");

      vi.mocked(isUserMember).mockResolvedValueOnce({ m_id: 50 });
      vi.mocked(writeUpdateArchiveProject).mockRejectedValueOnce(dbError);

      await switchArchiveProject(req, res, next);

      expect(next).toHaveBeenCalledWith(dbError);
      expect(status).not.toHaveBeenCalled();
    });
  });
});
