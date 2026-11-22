import { getIconStatus, getColorStatus } from "@/utils/status-task";

// ─── getIconStatus ────────────────────────────────────────────────────────────

describe("getIconStatus", () => {
  it("returns 'add' for new_task", () => {
    expect(getIconStatus("new_task")).toBe("add");
  });

  it("returns 'report' for in_review", () => {
    expect(getIconStatus("in_review")).toBe("report");
  });

  it("returns 'check' for approved", () => {
    expect(getIconStatus("approved")).toBe("check");
  });
});

// ─── getColorStatus ───────────────────────────────────────────────────────────

describe("getColorStatus", () => {
  describe("new_task", () => {
    it("returns the correct bg class", () => {
      expect(getColorStatus("new_task").bg).toBe("bg-background-secondary");
    });

    it("returns the correct border class", () => {
      expect(getColorStatus("new_task").border).toBe("border-border-muted");
    });
  });

  describe("in_review", () => {
    it("returns the correct bg class", () => {
      expect(getColorStatus("in_review").bg).toBe("bg-background-warming");
    });

    it("returns the correct border class", () => {
      expect(getColorStatus("in_review").border).toBe("border-border-warming");
    });
  });

  describe("approved", () => {
    it("returns the correct bg class", () => {
      expect(getColorStatus("approved").bg).toBe("bg-background-approve");
    });

    it("returns the correct border class", () => {
      expect(getColorStatus("approved").border).toBe("border-border-approve");
    });
  });

  it("returns an object with both bg and border keys", () => {
    const result = getColorStatus("new_task");
    expect(result).toHaveProperty("bg");
    expect(result).toHaveProperty("border");
  });

  it("returns different colors for each state", () => {
    const newTask = getColorStatus("new_task");
    const inReview = getColorStatus("in_review");
    const approved = getColorStatus("approved");

    expect(newTask.bg).not.toBe(inReview.bg);
    expect(inReview.bg).not.toBe(approved.bg);
    expect(newTask.bg).not.toBe(approved.bg);
  });
});
