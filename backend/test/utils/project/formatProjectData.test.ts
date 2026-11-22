import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { formatProjectData } from "../../../src/utils/project/format.js";
import type {
  ProjectData,
  TaskDate,
  TotalEachState,
} from "../../../src/types/query.js";

describe("formatProjectData", () => {
  const baseTime = new Date("2026-11-22T12:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(baseTime);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Empty Input ───────────────────────────────────────────────────────────

  describe("Empty input", () => {
    it("returns an empty array when projectData is empty", () => {
      const result = formatProjectData([], [], [], []);
      expect(result).toEqual([]);
    });
  });

  // ── Project Initialization ────────────────────────────────────────────────

  describe("Project initialization", () => {
    it("initializes project structure with default empty values", () => {
      const projects: ProjectData[] = [
        {
          p_id: 1,
          project_name: "Alpha Project",
          describe: "Alpha description",
          is_owner: true,
        },
      ];

      const result = formatProjectData(projects, [], [], []);

      expect(result).toEqual([
        {
          p_id: 1,
          project_name: "Alpha Project",
          describe: "Alpha description",
          is_owner: true,
          member_seeds: [],
          new_task: { count: 0, data: [] },
          in_review: { count: 0, data: [] },
          approved: { count: 0, data: [] },
        },
      ]);
    });

    it("does not create duplicate entries if projectData contains duplicate p_id", () => {
      const projects: ProjectData[] = [
        { p_id: 1, project_name: "Project A", describe: "Desc", is_owner: true },
        { p_id: 1, project_name: "Project A Duplicate", describe: "Desc", is_owner: true },
      ];

      const result = formatProjectData(projects, [], [], []);

      expect(result).toHaveLength(1);
      expect(result[0].p_id).toBe(1);
      expect(result[0].project_name).toBe("Project A");
    });
  });

  // ── Member Seeds Mapping ──────────────────────────────────────────────────

  describe("Member seeds mapping", () => {
    it("assigns member seeds to the corresponding projects", () => {
      const projects: ProjectData[] = [
        { p_id: 1, project_name: "Project 1", describe: "", is_owner: true },
        { p_id: 2, project_name: "Project 2", describe: "", is_owner: false },
      ];
      const memberSeeds = [
        { p_id: 1, avatar_seed: "seed-user-1" },
        { p_id: 2, avatar_seed: "seed-user-2" },
        { p_id: 1, avatar_seed: "seed-user-3" },
      ];

      const result = formatProjectData(projects, memberSeeds, [], []);

      expect(result[0].member_seeds).toEqual(["seed-user-1", "seed-user-3"]);
      expect(result[1].member_seeds).toEqual(["seed-user-2"]);
    });
  });

  // ── Total Each State Mapping ──────────────────────────────────────────────

  describe("Total each state mapping", () => {
    it("populates state counts correctly and converts count to number", () => {
      const projects: ProjectData[] = [
        { p_id: 1, project_name: "Project 1", describe: "", is_owner: true },
      ];
      const totalEachState: TotalEachState[] = [
        { p_id: 1, current_state: "new_task", count: 5 },
        { p_id: 1, current_state: "in_review", count: 2 },
        { p_id: 1, current_state: "approved", count: "8" as unknown as number },
      ];

      const result = formatProjectData(projects, [], totalEachState, []);

      expect(result[0].new_task.count).toBe(5);
      expect(result[0].in_review.count).toBe(2);
      expect(result[0].approved.count).toBe(8);
    });
  });

  // ── Task Data Mapping and 8-Minute Filter ──────────────────────────────────

  describe("Task data mapping and time filtering", () => {
    it("places new_task and in_review tasks into their state data regardless of age", () => {
      const projects: ProjectData[] = [
        { p_id: 1, project_name: "Project 1", describe: "", is_owner: true },
      ];

      // Created 1 hour ago
      const oldTime = new Date(baseTime.getTime() - 60 * 60 * 1000);

      const tasks: TaskDate[] = [
        {
          p_id: 1,
          user_name: "Alice",
          position: "Frontend",
          jobs: "Build UI",
          current_state: "new_task",
          create_at: oldTime,
        },
        {
          p_id: 1,
          user_name: "Bob",
          position: "Backend",
          jobs: "Create API",
          current_state: "in_review",
          create_at: oldTime,
        },
      ];

      const result = formatProjectData(projects, [], [], tasks);

      expect(result[0].new_task.data).toHaveLength(1);
      expect(result[0].new_task.data[0].jobs).toBe("Build UI");
      expect(result[0].in_review.data).toHaveLength(1);
      expect(result[0].in_review.data[0].jobs).toBe("Create API");
    });

    it("includes approved tasks created within the last 8 minutes", () => {
      const projects: ProjectData[] = [
        { p_id: 1, project_name: "Project 1", describe: "", is_owner: true },
      ];

      // Created 5 minutes ago
      const recentTime = new Date(baseTime.getTime() - 5 * 60 * 1000);

      const tasks: TaskDate[] = [
        {
          p_id: 1,
          user_name: "Charlie",
          position: "QA",
          jobs: "Test login flow",
          current_state: "approved",
          create_at: recentTime,
        },
      ];

      const result = formatProjectData(projects, [], [], tasks);

      expect(result[0].approved.data).toHaveLength(1);
      expect(result[0].approved.data[0].jobs).toBe("Test login flow");
    });

    it("includes approved tasks created exactly 8 minutes ago (threshold boundary)", () => {
      const projects: ProjectData[] = [
        { p_id: 1, project_name: "Project 1", describe: "", is_owner: true },
      ];

      // Exactly 8 minutes ago (8 * 60 * 1000 ms)
      const exactly8MinAgo = new Date(baseTime.getTime() - 8 * 60 * 1000);

      const tasks: TaskDate[] = [
        {
          p_id: 1,
          user_name: "Charlie",
          position: "QA",
          jobs: "Boundary task",
          current_state: "approved",
          create_at: exactly8MinAgo,
        },
      ];

      const result = formatProjectData(projects, [], [], tasks);

      expect(result[0].approved.data).toHaveLength(1);
      expect(result[0].approved.data[0].jobs).toBe("Boundary task");
    });

    it("excludes approved tasks created more than 8 minutes ago", () => {
      const projects: ProjectData[] = [
        { p_id: 1, project_name: "Project 1", describe: "", is_owner: true },
      ];

      // 8 minutes and 1 millisecond ago
      const olderThan8Min = new Date(baseTime.getTime() - (8 * 60 * 1000 + 1));
      // 30 minutes ago
      const veryOldTime = new Date(baseTime.getTime() - 30 * 60 * 1000);

      const tasks: TaskDate[] = [
        {
          p_id: 1,
          user_name: "Dave",
          position: "DevOps",
          jobs: "Old deployment",
          current_state: "approved",
          create_at: olderThan8Min,
        },
        {
          p_id: 1,
          user_name: "Eve",
          position: "DevOps",
          jobs: "Very old task",
          current_state: "approved",
          create_at: veryOldTime,
        },
      ];

      const result = formatProjectData(projects, [], [], tasks);

      expect(result[0].approved.data).toHaveLength(0);
    });
  });

  // ── Multi-Project Full Integration ────────────────────────────────────────

  describe("Multi-project full aggregation", () => {
    it("correctly aggregates member seeds, state counts, and tasks across multiple projects", () => {
      const projects: ProjectData[] = [
        { p_id: 10, project_name: "Project 10", describe: "Desc 10", is_owner: true },
        { p_id: 20, project_name: "Project 20", describe: "Desc 20", is_owner: false },
      ];

      const memberSeeds = [
        { p_id: 10, avatar_seed: "seed-10-a" },
        { p_id: 20, avatar_seed: "seed-20-a" },
        { p_id: 10, avatar_seed: "seed-10-b" },
      ];

      const totalEachState: TotalEachState[] = [
        { p_id: 10, current_state: "new_task", count: 2 },
        { p_id: 10, current_state: "approved", count: 4 },
        { p_id: 20, current_state: "in_review", count: 1 },
      ];

      const recentTime = new Date(baseTime.getTime() - 2 * 60 * 1000);
      const oldTime = new Date(baseTime.getTime() - 15 * 60 * 1000);

      const tasks: TaskDate[] = [
        {
          p_id: 10,
          user_name: "User 1",
          position: "Developer",
          jobs: "Task for P10 new",
          current_state: "new_task",
          create_at: oldTime,
        },
        {
          p_id: 10,
          user_name: "User 2",
          position: "Developer",
          jobs: "Task for P10 recent approved",
          current_state: "approved",
          create_at: recentTime,
        },
        {
          p_id: 10,
          user_name: "User 3",
          position: "Developer",
          jobs: "Task for P10 old approved",
          current_state: "approved",
          create_at: oldTime,
        },
        {
          p_id: 20,
          user_name: "User 4",
          position: "Designer",
          jobs: "Task for P20 in review",
          current_state: "in_review",
          create_at: recentTime,
        },
      ];

      const result = formatProjectData(projects, memberSeeds, totalEachState, tasks);

      expect(result).toHaveLength(2);

      // Project 10 assertions
      expect(result[0].p_id).toBe(10);
      expect(result[0].member_seeds).toEqual(["seed-10-a", "seed-10-b"]);
      expect(result[0].new_task.count).toBe(2);
      expect(result[0].new_task.data).toHaveLength(1);
      expect(result[0].new_task.data[0].jobs).toBe("Task for P10 new");
      expect(result[0].approved.count).toBe(4);
      expect(result[0].approved.data).toHaveLength(1);
      expect(result[0].approved.data[0].jobs).toBe("Task for P10 recent approved");
      expect(result[0].in_review.count).toBe(0);
      expect(result[0].in_review.data).toHaveLength(0);

      // Project 20 assertions
      expect(result[1].p_id).toBe(20);
      expect(result[1].member_seeds).toEqual(["seed-20-a"]);
      expect(result[1].in_review.count).toBe(1);
      expect(result[1].in_review.data).toHaveLength(1);
      expect(result[1].in_review.data[0].jobs).toBe("Task for P20 in review");
      expect(result[1].new_task.count).toBe(0);
      expect(result[1].approved.count).toBe(0);
    });
  });
});
