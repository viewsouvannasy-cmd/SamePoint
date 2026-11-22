import { describe, expect, it, vi, beforeEach } from "vitest";
import type { NextFunction, Request, Response } from "express";

// --- Mocks ---

vi.mock("../../../src/controllers/project/project-query.js", () => ({
  readProjectList: vi.fn(),
  readMemberSeed: vi.fn(),
  readTotalTaskOfEachState: vi.fn(),
  readTaskData: vi.fn(),
  writeNewProject: vi.fn(),
}));

vi.mock("../../../src/utils/project/format.js", () => ({
  formatProjectData: vi.fn(),
}));

// --- Imports (after mocks) ---

import {
  readProjectList,
  readMemberSeed,
  readTotalTaskOfEachState,
  readTaskData,
} from "../../../src/controllers/project/project-query.js";
import { formatProjectData } from "../../../src/utils/project/format.js";
import { getProjectList } from "../../../src/controllers/project/project-controller.js";

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

describe("getProjectList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Validation ────────────────────────────────────────────────────────────

  describe("Validation", () => {
    it("returns 400 when user_id is missing", async () => {
      const req = makeReq({});
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await getProjectList(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: expect.any(String),
        data: [],
      });
      expect(readProjectList).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 when user_id is not a positive integer", async () => {
      const req = makeReq({ user_id: -5 });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await getProjectList(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Invalid id",
        data: [],
      });
      expect(readProjectList).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 when user_id is zero", async () => {
      const req = makeReq({ user_id: 0 });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await getProjectList(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Invalid id",
        data: [],
      });
      expect(readProjectList).not.toHaveBeenCalled();
    });

    it("returns 400 when user_id is a string", async () => {
      const req = makeReq({ user_id: "not_a_number" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await getProjectList(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Invalid id",
        data: [],
      });
      expect(readProjectList).not.toHaveBeenCalled();
    });
  });

  // ── Success Cases ─────────────────────────────────────────────────────────

  describe("Success", () => {
    it("fetches, formats, and returns project list for valid user_id", async () => {
      const req = makeReq({ user_id: 1 });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      const mockProjects = [
        { p_id: 101, project_name: "Project Alpha", describe: "Desc 1", is_owner: true },
        { p_id: 102, project_name: "Project Beta", describe: "Desc 2", is_owner: false },
      ];
      const mockSeeds = [
        { p_id: 101, avatar_seed: "seed-1" },
        { p_id: 102, avatar_seed: "seed-2" },
      ];
      const mockTotals = [
        { p_id: 101, state: "new_task", total: 3 },
      ];
      const mockTasks = [
        { p_id: 101, t_id: 1, title: "Task 1", state: "new_task", create_at: "2026-01-01" },
      ];
      const mockFormattedData = [
        {
          p_id: 101,
          project_name: "Project Alpha",
          describe: "Desc 1",
          is_owner: true,
          member_seeds: ["seed-1"],
          new_task: { count: 3, data: mockTasks },
          in_review: { count: 0, data: [] },
          approved: { count: 0, data: [] },
        },
      ];

      vi.mocked(readProjectList).mockResolvedValueOnce(mockProjects as never);
      vi.mocked(readMemberSeed).mockResolvedValueOnce(mockSeeds as never);
      vi.mocked(readTotalTaskOfEachState).mockResolvedValueOnce(mockTotals as never);
      vi.mocked(readTaskData).mockResolvedValueOnce(mockTasks as never);
      vi.mocked(formatProjectData).mockReturnValueOnce(mockFormattedData as never);

      await getProjectList(req, res, next);

      expect(readProjectList).toHaveBeenCalledWith(1);
      expect(readMemberSeed).toHaveBeenCalledWith([101, 102]);
      expect(readTotalTaskOfEachState).toHaveBeenCalledWith([101, 102]);
      expect(readTaskData).toHaveBeenCalledWith([101, 102]);
      expect(formatProjectData).toHaveBeenCalledWith(
        mockProjects,
        mockSeeds,
        mockTotals,
        mockTasks,
      );
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        ok: true,
        msg: "Get project list",
        data: mockFormattedData,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("returns empty formatted data when user has no projects", async () => {
      const req = makeReq({ user_id: 2 });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      vi.mocked(readProjectList).mockResolvedValueOnce([]);
      vi.mocked(readMemberSeed).mockResolvedValueOnce([]);
      vi.mocked(readTotalTaskOfEachState).mockResolvedValueOnce([]);
      vi.mocked(readTaskData).mockResolvedValueOnce([]);
      vi.mocked(formatProjectData).mockReturnValueOnce([]);

      await getProjectList(req, res, next);

      expect(readProjectList).toHaveBeenCalledWith(2);
      expect(readMemberSeed).toHaveBeenCalledWith([]);
      expect(readTotalTaskOfEachState).toHaveBeenCalledWith([]);
      expect(readTaskData).toHaveBeenCalledWith([]);
      expect(formatProjectData).toHaveBeenCalledWith([], [], [], []);
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        ok: true,
        msg: "Get project list",
        data: [],
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ── Error Handling ────────────────────────────────────────────────────────

  describe("Error handling", () => {
    it("calls next with error when readProjectList throws", async () => {
      const req = makeReq({ user_id: 1 });
      const { res, status } = mockResponse();
      const next = mockNext();
      const dbError = new Error("Failed to read projects");

      vi.mocked(readProjectList).mockRejectedValueOnce(dbError);

      await getProjectList(req, res, next);

      expect(next).toHaveBeenCalledWith(dbError);
      expect(readMemberSeed).not.toHaveBeenCalled();
      expect(readTotalTaskOfEachState).not.toHaveBeenCalled();
      expect(readTaskData).not.toHaveBeenCalled();
      expect(formatProjectData).not.toHaveBeenCalled();
      expect(status).not.toHaveBeenCalled();
    });

    it("calls next with error when any parallel query fails", async () => {
      const req = makeReq({ user_id: 1 });
      const { res, status } = mockResponse();
      const next = mockNext();
      const seedError = new Error("Failed to read member seeds");

      vi.mocked(readProjectList).mockResolvedValueOnce([{ p_id: 101 }] as never);
      vi.mocked(readMemberSeed).mockRejectedValueOnce(seedError);
      vi.mocked(readTotalTaskOfEachState).mockResolvedValueOnce([]);
      vi.mocked(readTaskData).mockResolvedValueOnce([]);

      await getProjectList(req, res, next);

      expect(next).toHaveBeenCalledWith(seedError);
      expect(formatProjectData).not.toHaveBeenCalled();
      expect(status).not.toHaveBeenCalled();
    });

    it("calls next with error when formatProjectData throws", async () => {
      const req = makeReq({ user_id: 1 });
      const { res, status } = mockResponse();
      const next = mockNext();
      const formatError = new Error("Formatting failure");

      vi.mocked(readProjectList).mockResolvedValueOnce([{ p_id: 101 }] as never);
      vi.mocked(readMemberSeed).mockResolvedValueOnce([]);
      vi.mocked(readTotalTaskOfEachState).mockResolvedValueOnce([]);
      vi.mocked(readTaskData).mockResolvedValueOnce([]);
      vi.mocked(formatProjectData).mockImplementationOnce(() => {
        throw formatError;
      });

      await getProjectList(req, res, next);

      expect(next).toHaveBeenCalledWith(formatError);
      expect(status).not.toHaveBeenCalled();
    });
  });
});
