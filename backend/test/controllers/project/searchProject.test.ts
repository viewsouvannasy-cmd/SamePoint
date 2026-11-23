import { describe, expect, it, vi, beforeEach } from "vitest";
import type { NextFunction, Request, Response } from "express";

// --- Mocks ---

vi.mock("../../../src/controllers/project/project-query.js", () => ({
  searchProjectList: vi.fn(),
  readMemberSeed: vi.fn(),
  readTotalTaskOfEachState: vi.fn(),
  readTaskData: vi.fn(),
}));

vi.mock("../../../src/utils/project/format.js", () => ({
  formatProjectData: vi.fn(),
}));

// --- Imports (after mocks) ---

import {
  searchProjectList,
  readMemberSeed,
  readTotalTaskOfEachState,
  readTaskData,
} from "../../../src/controllers/project/project-query.js";
import { formatProjectData } from "../../../src/utils/project/format.js";
import { searchProject } from "../../../src/controllers/project/project-controller.js";

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

describe("searchProject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Validation ────────────────────────────────────────────────────────────

  describe("Validation", () => {
    it("returns 400 when user_id is missing", async () => {
      const req = makeReq({ search: "alpha" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await searchProject(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: expect.any(String),
        data: [],
      });
      expect(searchProjectList).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 when user_id is not a positive integer", async () => {
      const req = makeReq({ user_id: -5, search: "alpha" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await searchProject(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: "Invalid id",
        data: [],
      });
      expect(searchProjectList).not.toHaveBeenCalled();
    });

    it("returns 400 when search is missing", async () => {
      const req = makeReq({ user_id: 1 });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await searchProject(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: expect.any(String),
        data: [],
      });
      expect(searchProjectList).not.toHaveBeenCalled();
    });

    it("returns 400 when search is not a string", async () => {
      const req = makeReq({ user_id: 1, search: 123 });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await searchProject(req, res, next);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        ok: false,
        msg: expect.any(String),
        data: [],
      });
      expect(searchProjectList).not.toHaveBeenCalled();
    });
  });

  // ── Empty Search Query ────────────────────────────────────────────────────

  describe("Empty search query", () => {
    it("returns 200 with empty data and skips DB query when search is empty string", async () => {
      const req = makeReq({ user_id: 1, search: "" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await searchProject(req, res, next);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        ok: true,
        msg: "Search success",
        data: [],
      });
      expect(searchProjectList).not.toHaveBeenCalled();
      expect(readMemberSeed).not.toHaveBeenCalled();
      expect(formatProjectData).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 200 with empty data when search is only whitespace (trimmed to empty)", async () => {
      const req = makeReq({ user_id: 1, search: "    " });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      await searchProject(req, res, next);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        ok: true,
        msg: "Search success",
        data: [],
      });
      expect(searchProjectList).not.toHaveBeenCalled();
    });
  });

  // ── Success Cases ─────────────────────────────────────────────────────────

  describe("Success", () => {
    it("searches, aggregates related data, and returns formatted results", async () => {
      const req = makeReq({ user_id: 1, search: "Alpha" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      const mockSearchResults = [
        { p_id: 101, project_name: "alpha project", describe: "desc 1", is_owner: true },
        { p_id: 102, project_name: "alphabet", describe: "desc 2", is_owner: false },
      ];
      const mockSeeds = [{ p_id: 101, avatar_seed: "seed-1" }];
      const mockTotals = [{ p_id: 101, current_state: "new_task", count: 2 }];
      const mockTasks = [
        {
          p_id: 101,
          user_name: "Alice",
          position: "Dev",
          jobs: "Build feature",
          current_state: "new_task",
          create_at: new Date(),
        },
      ];
      const mockFormattedData = [
        {
          p_id: 101,
          project_name: "alpha project",
          describe: "desc 1",
          is_owner: true,
          member_seeds: ["seed-1"],
          new_task: { count: 2, data: mockTasks },
          in_review: { count: 0, data: [] },
          approved: { count: 0, data: [] },
        },
      ];

      vi.mocked(searchProjectList).mockResolvedValueOnce(mockSearchResults as never);
      vi.mocked(readMemberSeed).mockResolvedValueOnce(mockSeeds as never);
      vi.mocked(readTotalTaskOfEachState).mockResolvedValueOnce(mockTotals as never);
      vi.mocked(readTaskData).mockResolvedValueOnce(mockTasks as never);
      vi.mocked(formatProjectData).mockReturnValueOnce(mockFormattedData as never);

      await searchProject(req, res, next);

      // Schema trims and lowercases search term: "Alpha" -> "alpha"
      expect(searchProjectList).toHaveBeenCalledWith(1, "alpha");
      expect(readMemberSeed).toHaveBeenCalledWith([101, 102]);
      expect(readTotalTaskOfEachState).toHaveBeenCalledWith([101, 102]);
      expect(readTaskData).toHaveBeenCalledWith([101, 102]);
      expect(formatProjectData).toHaveBeenCalledWith(
        mockSearchResults,
        mockSeeds,
        mockTotals,
        mockTasks,
      );
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        ok: true,
        msg: "Search success",
        data: mockFormattedData,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("handles search queries with leading/trailing spaces and mixed casing", async () => {
      const req = makeReq({ user_id: 2, search: "   PROJECT Pegasus   " });
      const { res, status } = mockResponse();
      const next = mockNext();

      vi.mocked(searchProjectList).mockResolvedValueOnce([]);
      vi.mocked(readMemberSeed).mockResolvedValueOnce([]);
      vi.mocked(readTotalTaskOfEachState).mockResolvedValueOnce([]);
      vi.mocked(readTaskData).mockResolvedValueOnce([]);
      vi.mocked(formatProjectData).mockReturnValueOnce([]);

      await searchProject(req, res, next);

      expect(searchProjectList).toHaveBeenCalledWith(2, "project pegasus");
      expect(status).toHaveBeenCalledWith(200);
    });

    it("returns empty array when no projects match search query", async () => {
      const req = makeReq({ user_id: 1, search: "nonexistent" });
      const { res, status, json } = mockResponse();
      const next = mockNext();

      vi.mocked(searchProjectList).mockResolvedValueOnce([]);
      vi.mocked(readMemberSeed).mockResolvedValueOnce([]);
      vi.mocked(readTotalTaskOfEachState).mockResolvedValueOnce([]);
      vi.mocked(readTaskData).mockResolvedValueOnce([]);
      vi.mocked(formatProjectData).mockReturnValueOnce([]);

      await searchProject(req, res, next);

      expect(searchProjectList).toHaveBeenCalledWith(1, "nonexistent");
      expect(readMemberSeed).toHaveBeenCalledWith([]);
      expect(readTotalTaskOfEachState).toHaveBeenCalledWith([]);
      expect(readTaskData).toHaveBeenCalledWith([]);
      expect(formatProjectData).toHaveBeenCalledWith([], [], [], []);
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        ok: true,
        msg: "Search success",
        data: [],
      });
    });
  });

  // ── Error Handling ────────────────────────────────────────────────────────

  describe("Error handling", () => {
    it("calls next with error when searchProjectList throws", async () => {
      const req = makeReq({ user_id: 1, search: "alpha" });
      const { res, status } = mockResponse();
      const next = mockNext();
      const dbError = new Error("Database error on search");

      vi.mocked(searchProjectList).mockRejectedValueOnce(dbError);

      await searchProject(req, res, next);

      expect(next).toHaveBeenCalledWith(dbError);
      expect(readMemberSeed).not.toHaveBeenCalled();
      expect(readTotalTaskOfEachState).not.toHaveBeenCalled();
      expect(readTaskData).not.toHaveBeenCalled();
      expect(formatProjectData).not.toHaveBeenCalled();
      expect(status).not.toHaveBeenCalled();
    });

    it("calls next with error when any parallel query in Promise.all fails", async () => {
      const req = makeReq({ user_id: 1, search: "alpha" });
      const { res, status } = mockResponse();
      const next = mockNext();
      const queryError = new Error("Failed to read task data");

      vi.mocked(searchProjectList).mockResolvedValueOnce([{ p_id: 101 }] as never);
      vi.mocked(readMemberSeed).mockResolvedValueOnce([]);
      vi.mocked(readTotalTaskOfEachState).mockResolvedValueOnce([]);
      vi.mocked(readTaskData).mockRejectedValueOnce(queryError);

      await searchProject(req, res, next);

      expect(next).toHaveBeenCalledWith(queryError);
      expect(formatProjectData).not.toHaveBeenCalled();
      expect(status).not.toHaveBeenCalled();
    });

    it("calls next with error when formatProjectData throws", async () => {
      const req = makeReq({ user_id: 1, search: "alpha" });
      const { res, status } = mockResponse();
      const next = mockNext();
      const formatError = new Error("Format error");

      vi.mocked(searchProjectList).mockResolvedValueOnce([{ p_id: 101 }] as never);
      vi.mocked(readMemberSeed).mockResolvedValueOnce([]);
      vi.mocked(readTotalTaskOfEachState).mockResolvedValueOnce([]);
      vi.mocked(readTaskData).mockResolvedValueOnce([]);
      vi.mocked(formatProjectData).mockImplementationOnce(() => {
        throw formatError;
      });

      await searchProject(req, res, next);

      expect(next).toHaveBeenCalledWith(formatError);
      expect(status).not.toHaveBeenCalled();
    });
  });
});
