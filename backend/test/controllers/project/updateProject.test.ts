import { describe, expect, it, vi, beforeEach } from "vitest";
import type { NextFunction, Request, Response } from "express";

// --- Mocks ---

vi.mock("../../../src/controllers/project/project-query.js", () => ({
  writeUpdateProject: vi.fn(),
}));

vi.mock("../../../src/utils/query/checkOwner.js", () => ({
  isProjectOwner: vi.fn(),
}));

// --- Imports (after mocks) ---

import { writeUpdateProject } from "../../../src/controllers/project/project-query.js";
import { isProjectOwner } from "../../../src/utils/query/checkOwner.js";
import { updateProject } from "../../../src/controllers/project/project-controller.js";

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

describe("updateProject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Validation ────────────────────────────────────────────────────────────

  describe("Validation", () => {
    it("returns 400 when user_id is missing", async () => {
      const req = makeReq({
        project_name: "Updated Name",
        describe: "Updated description",
      });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await updateProject(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: {
          point: "user_id",
          content: expect.any(String),
        },
        data: [],
      });
      expect(isProjectOwner).not.toHaveBeenCalled();
      expect(writeUpdateProject).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 when user_id is not a positive integer", async () => {
      const req = makeReq({
        user_id: -10,
        project_name: "Updated Name",
      });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await updateProject(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: {
          point: "user_id",
          content: "Invalid id",
        },
        data: [],
      });
      expect(isProjectOwner).not.toHaveBeenCalled();
    });

    it("returns 400 when project_name is missing", async () => {
      const req = makeReq({
        user_id: 1,
      });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await updateProject(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: {
          point: "project_name",
          content: expect.any(String),
        },
        data: [],
      });
      expect(isProjectOwner).not.toHaveBeenCalled();
      expect(writeUpdateProject).not.toHaveBeenCalled();
    });

    it("returns 400 when project_name is shorter than 5 characters", async () => {
      const req = makeReq({
        user_id: 1,
        project_name: "Edit",
      });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await updateProject(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: {
          point: "project_name",
          content: "Name must be at least 5 characters",
        },
        data: [],
      });
      expect(isProjectOwner).not.toHaveBeenCalled();
    });

    it("returns 400 when project_name is longer than 40 characters", async () => {
      const req = makeReq({
        user_id: 1,
        project_name: "X".repeat(41),
      });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await updateProject(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: {
          point: "project_name",
          content: "Name must be at most 40 characters",
        },
        data: [],
      });
      expect(isProjectOwner).not.toHaveBeenCalled();
    });

    it("returns 400 when describe exceeds 255 characters", async () => {
      const req = makeReq({
        user_id: 1,
        project_name: "Updated Name",
        describe: "D".repeat(256),
      });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await updateProject(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: {
          point: "describe",
          content: "Description must be at most 255 characters",
        },
        data: [],
      });
      expect(isProjectOwner).not.toHaveBeenCalled();
    });
  });

  // ── Authorization ─────────────────────────────────────────────────────────

  describe("Authorization", () => {
    it("returns 401 when the user is not the project owner", async () => {
      const req = makeReq(
        {
          user_id: 5,
          project_name: "Attempted Edit",
          describe: "Some desc",
        },
        { p_id: "12" },
      );
      const { res, status, json } = mockResponse();
      const next = mockNext();

      vi.mocked(isProjectOwner).mockResolvedValueOnce(false);

      await updateProject(req, res, next);

      expect(isProjectOwner).toHaveBeenCalledWith(5, 12);
      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "You are not be able to edit this project",
        data: [],
      });
      expect(writeUpdateProject).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ── Success Cases ─────────────────────────────────────────────────────────

  describe("Success", () => {
    it("updates project successfully and returns 202 when user is owner", async () => {
      const req = makeReq(
        {
          user_id: 1,
          project_name: "Renamed Project",
          describe: "Updated description text",
        },
        { p_id: "42" },
      );
      const { res, status, json } = mockResponse();
      const next = mockNext();

      vi.mocked(isProjectOwner).mockResolvedValueOnce(true);
      vi.mocked(writeUpdateProject).mockResolvedValueOnce();

      await updateProject(req, res, next);

      expect(isProjectOwner).toHaveBeenCalledWith(1, 42);
      expect(writeUpdateProject).toHaveBeenCalledWith(
        42,
        "Renamed Project",
        "Updated description text",
      );
      expect(status).toHaveBeenCalledWith(202);
      expect(json).toHaveBeenCalledWith({
        ok: true,
        msg: "Update project success",
        data: [],
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("defaults describe to empty string when omitted", async () => {
      const req = makeReq(
        {
          user_id: 2,
          project_name: "Project Without Desc",
        },
        { p_id: "10" },
      );
      const { res, status, json } = mockResponse();
      const next = mockNext();

      vi.mocked(isProjectOwner).mockResolvedValueOnce(true);
      vi.mocked(writeUpdateProject).mockResolvedValueOnce();

      await updateProject(req, res, next);

      expect(writeUpdateProject).toHaveBeenCalledWith(
        10,
        "Project Without Desc",
        "",
      );
      expect(status).toHaveBeenCalledWith(202);
      expect(json).toHaveBeenCalledWith({
        ok: true,
        msg: "Update project success",
        data: [],
      });
    });

    it("trims whitespace from project_name and describe", async () => {
      const req = makeReq(
        {
          user_id: 3,
          project_name: "   Trimmed Name   ",
          describe: "   Trimmed Description   ",
        },
        { p_id: "7" },
      );
      const { res, status, json } = mockResponse();
      const next = mockNext();

      vi.mocked(isProjectOwner).mockResolvedValueOnce(true);
      vi.mocked(writeUpdateProject).mockResolvedValueOnce();

      await updateProject(req, res, next);

      expect(writeUpdateProject).toHaveBeenCalledWith(
        7,
        "Trimmed Name",
        "Trimmed Description",
      );
      expect(status).toHaveBeenCalledWith(202);
    });
  });

  // ── Error Handling ────────────────────────────────────────────────────────

  describe("Error handling", () => {
    it("calls next with error when isProjectOwner throws", async () => {
      const req = makeReq(
        {
          user_id: 1,
          project_name: "Project Name",
          describe: "Description",
        },
        { p_id: "42" },
      );
      const { res, status } = mockResponse();
      const next = mockNext();
      const dbError = new Error("Database error on check owner");

      vi.mocked(isProjectOwner).mockRejectedValueOnce(dbError);

      await updateProject(req, res, next);

      expect(next).toHaveBeenCalledWith(dbError);
      expect(writeUpdateProject).not.toHaveBeenCalled();
      expect(status).not.toHaveBeenCalled();
    });

    it("calls next with error when writeUpdateProject throws", async () => {
      const req = makeReq(
        {
          user_id: 1,
          project_name: "Project Name",
          describe: "Description",
        },
        { p_id: "42" },
      );
      const { res, status } = mockResponse();
      const next = mockNext();
      const dbError = new Error("Database error on update project");

      vi.mocked(isProjectOwner).mockResolvedValueOnce(true);
      vi.mocked(writeUpdateProject).mockRejectedValueOnce(dbError);

      await updateProject(req, res, next);

      expect(next).toHaveBeenCalledWith(dbError);
      expect(status).not.toHaveBeenCalled();
    });
  });
});
