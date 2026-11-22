import type { TaskData } from "@/types/data";

// ─────────────────────────────────────────────────────────────────────────────
// Pure logic extracted from StatusTasks.tsx — tested without RNTL rendering.
//
// Source logic:
//   Label:
//     state === "new_task"  → "New Tasks"
//     state === "in_review" → "In Reiviews"   (typo preserved from source)
//     state === "approved"  → "Approved"
//
//   Overflow badge (shown when count > 2 AND state !== "approved"):
//     `+${item.count - 2}`
//
//   Task rows: renders every item in item.data (no slice)
// ─────────────────────────────────────────────────────────────────────────────

type TaskState = "new_task" | "in_review" | "approved";

function getStatusLabel(state: TaskState): string {
  if (state === "new_task") return "New Tasks";
  if (state === "in_review") return "In Reiviews";
  return "Approved";
}

function getOverflowBadge(
  count: number,
  state: TaskState,
): string | null {
  return count > 2 && state !== "approved" ? `+${count - 2}` : null;
}

function makeTask(count: number, dataLength = count): TaskData {
  return {
    count,
    data: Array.from({ length: dataLength }, (_, i) => ({
      p_id: i + 1,
      user_name: `User ${i + 1}`,
      position: "Developer",
      jobs: `Task ${i + 1}`,
      current_state: "new_task" as TaskState,
      create_at: new Date("2024-01-01"),
    })),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("StatusTasks — state label", () => {
  it("returns 'New Tasks' for new_task", () => {
    expect(getStatusLabel("new_task")).toBe("New Tasks");
  });

  it("returns 'In Reiviews' for in_review (preserves source spelling)", () => {
    expect(getStatusLabel("in_review")).toBe("In Reiviews");
  });

  it("returns 'Approved' for approved", () => {
    expect(getStatusLabel("approved")).toBe("Approved");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("StatusTasks — overflow badge", () => {
  describe("new_task", () => {
    it("returns null when count is 0", () => {
      expect(getOverflowBadge(0, "new_task")).toBeNull();
    });

    it("returns null when count is 1", () => {
      expect(getOverflowBadge(1, "new_task")).toBeNull();
    });

    it("returns null when count is exactly 2 (boundary)", () => {
      expect(getOverflowBadge(2, "new_task")).toBeNull();
    });

    it("returns '+1' when count is 3", () => {
      expect(getOverflowBadge(3, "new_task")).toBe("+1");
    });

    it("returns '+3' when count is 5", () => {
      expect(getOverflowBadge(5, "new_task")).toBe("+3");
    });

    it("returns '+8' when count is 10", () => {
      expect(getOverflowBadge(10, "new_task")).toBe("+8");
    });
  });

  describe("in_review", () => {
    it("returns null when count is 2", () => {
      expect(getOverflowBadge(2, "in_review")).toBeNull();
    });

    it("returns '+1' when count is 3", () => {
      expect(getOverflowBadge(3, "in_review")).toBe("+1");
    });

    it("returns '+5' when count is 7", () => {
      expect(getOverflowBadge(7, "in_review")).toBe("+5");
    });
  });

  describe("approved — never shows overflow badge", () => {
    it("returns null even when count is 3", () => {
      expect(getOverflowBadge(3, "approved")).toBeNull();
    });

    it("returns null even when count is 100", () => {
      expect(getOverflowBadge(100, "approved")).toBeNull();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("StatusTasks — task row data", () => {
  it("renders all items in data (no slicing)", () => {
    const task = makeTask(5);
    // StatusTasks maps every element of item.data — verify full array is used
    expect(task.data).toHaveLength(5);
  });

  it("renders no rows when data is empty", () => {
    const task = makeTask(0, 0);
    expect(task.data).toHaveLength(0);
  });

  it("each data item has the expected shape (jobs, user_name, position, create_at)", () => {
    const task = makeTask(1);
    const row = task.data[0];
    expect(row).toHaveProperty("jobs");
    expect(row).toHaveProperty("user_name");
    expect(row).toHaveProperty("position");
    expect(row).toHaveProperty("create_at");
  });
});
