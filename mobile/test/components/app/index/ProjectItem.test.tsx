import type { ProjectItemData, TaskData } from "@/types/data";

// ─────────────────────────────────────────────────────────────────────────────
// Pure logic extracted from ProjectItem.tsx — tested without RNTL rendering.
//
// Source calculations:
//   const isAllEmpty =
//     item.new_task.data.length + item.in_review.data.length + item.approved.data.length === 0;
//
//   const total_tasks =
//     item.new_task.count + item.in_review.count + item.approved.count;
//
//   const total_completed_tasks = item.approved.count;
//
//   const completePretenage =
//     total_tasks === 0 ? 0 : Math.round((total_completed_tasks / total_tasks) * 100);
//
//   member overflow: item.member_seeds.length > 4 → `+${length - 4}`
//   avatar slice:   item.member_seeds.slice(0, 4)
// ─────────────────────────────────────────────────────────────────────────────

function makeTask(count: number, dataLength: number): TaskData {
  return { count, data: Array.from({ length: dataLength }) } as TaskData;
}

function getIsAllEmpty(item: Pick<ProjectItemData, "new_task" | "in_review" | "approved">) {
  return (
    item.new_task.data.length +
      item.in_review.data.length +
      item.approved.data.length ===
    0
  );
}

function getTotalTasks(item: Pick<ProjectItemData, "new_task" | "in_review" | "approved">) {
  return item.new_task.count + item.in_review.count + item.approved.count;
}

function getCompletePercentage(approved_count: number, total_tasks: number) {
  return total_tasks === 0
    ? 0
    : Math.round((approved_count / total_tasks) * 100);
}

function getVisibleSeeds(seeds: string[]) {
  return seeds.slice(0, 4);
}

function getOverflowCount(seeds: string[]): string | null {
  return seeds.length > 4 ? `+${seeds.length - 4}` : null;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("ProjectItem — isAllEmpty", () => {
  it("is true when all task data arrays are empty", () => {
    const item = {
      new_task: makeTask(0, 0),
      in_review: makeTask(0, 0),
      approved: makeTask(0, 0),
    };
    expect(getIsAllEmpty(item)).toBe(true);
  });

  it("is false when new_task has data", () => {
    const item = {
      new_task: makeTask(2, 2),
      in_review: makeTask(0, 0),
      approved: makeTask(0, 0),
    };
    expect(getIsAllEmpty(item)).toBe(false);
  });

  it("is false when in_review has data", () => {
    const item = {
      new_task: makeTask(0, 0),
      in_review: makeTask(1, 1),
      approved: makeTask(0, 0),
    };
    expect(getIsAllEmpty(item)).toBe(false);
  });

  it("is false when approved has data", () => {
    const item = {
      new_task: makeTask(0, 0),
      in_review: makeTask(0, 0),
      approved: makeTask(3, 3),
    };
    expect(getIsAllEmpty(item)).toBe(false);
  });

  it("is false when all three buckets have data", () => {
    const item = {
      new_task: makeTask(1, 1),
      in_review: makeTask(2, 2),
      approved: makeTask(1, 1),
    };
    expect(getIsAllEmpty(item)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("ProjectItem — total_tasks", () => {
  it("returns 0 when all counts are 0", () => {
    const item = {
      new_task: makeTask(0, 0),
      in_review: makeTask(0, 0),
      approved: makeTask(0, 0),
    };
    expect(getTotalTasks(item)).toBe(0);
  });

  it("sums counts across all three buckets", () => {
    const item = {
      new_task: makeTask(3, 3),
      in_review: makeTask(2, 2),
      approved: makeTask(5, 5),
    };
    expect(getTotalTasks(item)).toBe(10);
  });

  it("returns only approved count when others are 0", () => {
    const item = {
      new_task: makeTask(0, 0),
      in_review: makeTask(0, 0),
      approved: makeTask(4, 4),
    };
    expect(getTotalTasks(item)).toBe(4);
  });

  it("count is independent of data array length", () => {
    // count and data.length can differ — total_tasks uses count
    const item = {
      new_task: makeTask(10, 2), // count=10 but only 2 items in data
      in_review: makeTask(5, 2),
      approved: makeTask(3, 1),
    };
    expect(getTotalTasks(item)).toBe(18);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("ProjectItem — completePercentage", () => {
  it("returns 0 when total_tasks is 0 (no divide-by-zero)", () => {
    expect(getCompletePercentage(0, 0)).toBe(0);
  });

  it("returns 100 when all tasks are approved", () => {
    expect(getCompletePercentage(10, 10)).toBe(100);
  });

  it("returns 50 when half the tasks are approved", () => {
    expect(getCompletePercentage(5, 10)).toBe(50);
  });

  it("rounds to nearest integer", () => {
    // 1/3 = 33.333... → rounds to 33
    expect(getCompletePercentage(1, 3)).toBe(33);
    // 2/3 = 66.666... → rounds to 67
    expect(getCompletePercentage(2, 3)).toBe(67);
  });

  it("returns 0 when approved count is 0 but tasks exist", () => {
    expect(getCompletePercentage(0, 5)).toBe(0);
  });

  it("calculates correctly for a typical project (5 approved / 10 total)", () => {
    const approved = 5;
    const total = 10;
    expect(getCompletePercentage(approved, total)).toBe(50);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("ProjectItem — member avatar slice", () => {
  it("shows all seeds when there are 4 or fewer", () => {
    expect(getVisibleSeeds(["a", "b", "c"])).toEqual(["a", "b", "c"]);
    expect(getVisibleSeeds(["a", "b", "c", "d"])).toEqual(["a", "b", "c", "d"]);
  });

  it("shows only the first 4 seeds when there are more than 4", () => {
    const seeds = ["s1", "s2", "s3", "s4", "s5", "s6"];
    expect(getVisibleSeeds(seeds)).toEqual(["s1", "s2", "s3", "s4"]);
  });

  it("returns an empty array when there are no members", () => {
    expect(getVisibleSeeds([])).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("ProjectItem — member overflow count", () => {
  it("returns null when there are 4 or fewer members", () => {
    expect(getOverflowCount(["a", "b", "c"])).toBeNull();
    expect(getOverflowCount(["a", "b", "c", "d"])).toBeNull();
  });

  it("returns '+1' when there are 5 members", () => {
    expect(getOverflowCount(["s1", "s2", "s3", "s4", "s5"])).toBe("+1");
  });

  it("returns '+2' when there are 6 members", () => {
    expect(getOverflowCount(["s1", "s2", "s3", "s4", "s5", "s6"])).toBe("+2");
  });

  it("returns '+6' when there are 10 members", () => {
    expect(getOverflowCount(Array.from({ length: 10 }, (_, i) => `s${i}`))).toBe("+6");
  });

  it("returns null when there are no members", () => {
    expect(getOverflowCount([])).toBeNull();
  });
});
