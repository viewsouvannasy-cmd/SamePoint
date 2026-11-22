import { describe, expect, it, vi, beforeEach } from "vitest";
import type { NextFunction, Request, Response } from "express";

// --- Mocks ---

vi.mock("../../../src/controllers/project/project-query.js", () => ({
  writeNewProject: vi.fn(),
  readProjectList: vi.fn(),
  readMemberSeed: vi.fn(),
  readTotalTaskOfEachState: vi.fn(),
  readTaskData: vi.fn(),
}));

vi.mock("../../../src/controllers/project/member/member-query.js", () => ({
  writeNewMember: vi.fn(),
}));

// --- Imports (after mocks) ---

import { writeNewProject } from "../../../src/controllers/project/project-query.js";
import { writeNewMember } from "../../../src/controllers/project/member/member-query.js";
import { createProject } from "../../../src/controllers/project/project-controller.js";

// --- Helpers ---

const mockResponse = () => {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { res: { status } as unknown as Response, status, json };
};

const mockNext = () => vi.fn() as unknown as NextFunction;

const makeReq = (body: unknown): Request =>
  ({ body } as unknown as Request);

// --- Tests ---

describe("createProject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Validation ────────────────────────────────────────────────────────────

  describe("Validation", () => {
    it("returns 400 when user_id is missing", async () => {
      const req = makeReq({
        project_name: "Project Alpha",
        describe: "Test description",
      });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await createProject(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: {
          point: "user_id",
          content: expect.any(String),
        },
        data: [],
      });
      expect(writeNewProject).not.toHaveBeenCalled();
      expect(writeNewMember).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 when user_id is not a positive integer", async () => {
      const req = makeReq({
        user_id: -1,
        project_name: "Project Alpha",
      });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await createProject(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: {
          point: "user_id",
          content: "Invalid id",
        },
        data: [],
      });
      expect(writeNewProject).not.toHaveBeenCalled();
    });

    it("returns 400 when project_name is missing", async () => {
      const req = makeReq({
        user_id: 1,
      });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await createProject(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: {
          point: "project_name",
          content: expect.any(String),
        },
        data: [],
      });
      expect(writeNewProject).not.toHaveBeenCalled();
      expect(writeNewMember).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 when project_name is shorter than 5 characters", async () => {
      const req = makeReq({
        user_id: 1,
        project_name: "Proj",
      });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await createProject(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: {
          point: "project_name",
          content: "Name must be at least 5 characters",
        },
        data: [],
      });
      expect(writeNewProject).not.toHaveBeenCalled();
    });

    it("returns 400 when project_name is longer than 40 characters", async () => {
      const req = makeReq({
        user_id: 1,
        project_name: "A".repeat(41),
      });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await createProject(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: {
          point: "project_name",
          content: "Name must be at most 40 characters",
        },
        data: [],
      });
      expect(writeNewProject).not.toHaveBeenCalled();
    });

    it("returns 400 when describe exceeds 255 characters", async () => {
      const req = makeReq({
        user_id: 1,
        project_name: "Project Alpha",
        describe: "D".repeat(256),
      });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await createProject(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: {
          point: "describe",
          content: "Description must be at most 255 characters",
        },
        data: [],
      });
      expect(writeNewProject).not.toHaveBeenCalled();
    });
  });

  // ── Success Cases ─────────────────────────────────────────────────────────

  describe("Success", () => {
    it("creates a new project and assigns admin member when all fields are provided", async () => {
      const validBody = {
        user_id: 1,
        project_name: "Project Pegasus",
        describe: "A groundbreaking secret project",
      };
      const req = makeReq(validBody);
      const { res, status, json } = mockResponse();
      const next = mockNext();

      vi.mocked(writeNewProject).mockResolvedValueOnce([{ p_id: 42 }]);
      vi.mocked(writeNewMember).mockResolvedValueOnce();

      await createProject(req, res, next);

      expect(writeNewProject).toHaveBeenCalledWith(
        "Project Pegasus",
        "A groundbreaking secret project",
      );
      expect(writeNewMember).toHaveBeenCalledWith(42, 1, "admin", true);
      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({
        ok: true,
        msg: "Create project success",
        data: [],
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("creates a new project with default empty description when describe is omitted", async () => {
      const req = makeReq({
        user_id: 2,
        project_name: "Minimal Project",
      });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      vi.mocked(writeNewProject).mockResolvedValueOnce([{ p_id: 99 }]);
      vi.mocked(writeNewMember).mockResolvedValueOnce();

      await createProject(req, res, next);

      expect(writeNewProject).toHaveBeenCalledWith("Minimal Project", "");
      expect(writeNewMember).toHaveBeenCalledWith(99, 2, "admin", true);
      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({
        ok: true,
        msg: "Create project success",
        data: [],
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("trims whitespace from project_name and describe", async () => {
      const req = makeReq({
        user_id: 3,
        project_name: "   Trimmed Project   ",
        describe: "   Trimmed description   ",
      });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      vi.mocked(writeNewProject).mockResolvedValueOnce([{ p_id: 10 }]);
      vi.mocked(writeNewMember).mockResolvedValueOnce();

      await createProject(req, res, next);

      expect(writeNewProject).toHaveBeenCalledWith(
        "Trimmed Project",
        "Trimmed description",
      );
      expect(writeNewMember).toHaveBeenCalledWith(10, 3, "admin", true);
      expect(status).toHaveBeenCalledWith(201);
    });
  });

  // ── Error Handling ────────────────────────────────────────────────────────

  describe("Error handling", () => {
    it("calls next with error when writeNewProject throws", async () => {
      const req = makeReq({
        user_id: 1,
        project_name: "Project Alpha",
        describe: "Test description",
      });
      const { res, status } = mockResponse();
      const next = mockNext();
      const dbError = new Error("Database connection failed");

      vi.mocked(writeNewProject).mockRejectedValueOnce(dbError);

      await createProject(req, res, next);

      expect(next).toHaveBeenCalledWith(dbError);
      expect(writeNewMember).not.toHaveBeenCalled();
      expect(status).not.toHaveBeenCalled();
    });

    it("calls next with error when writeNewMember throws", async () => {
      const req = makeReq({
        user_id: 1,
        project_name: "Project Alpha",
        describe: "Test description",
      });
      const { res, status } = mockResponse();
      const next = mockNext();
      const memberError = new Error("Member assignment failed");

      vi.mocked(writeNewProject).mockResolvedValueOnce([{ p_id: 42 }]);
      vi.mocked(writeNewMember).mockRejectedValueOnce(memberError);

      await createProject(req, res, next);

      expect(writeNewProject).toHaveBeenCalledWith(
        "Project Alpha",
        "Test description",
      );
      expect(writeNewMember).toHaveBeenCalledWith(42, 1, "admin", true);
      expect(next).toHaveBeenCalledWith(memberError);
      expect(status).not.toHaveBeenCalled();
    });
  });
});
