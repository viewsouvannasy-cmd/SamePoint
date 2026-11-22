import { getTimeAgo } from "@/utils/calculate";

// Helper: returns a Date that is `seconds` seconds in the past
const secondsAgo = (s: number) => new Date(Date.now() - s * 1000);
const minutesAgo = (m: number) => secondsAgo(m * 60);
const hoursAgo = (h: number) => minutesAgo(h * 60);
const daysAgo = (d: number) => hoursAgo(d * 24);
const weeksAgo = (w: number) => daysAgo(w * 7);
const monthsAgo = (mo: number) => daysAgo(mo * 30);
const yearsAgo = (y: number) => daysAgo(y * 365);

describe("getTimeAgo", () => {
  // ── Invalid input ──────────────────────────────────────────────────────────

  describe("invalid input", () => {
    it("returns empty string for an invalid date string", () => {
      expect(getTimeAgo("not-a-date" as unknown as Date)).toBe("");
    });

    it("returns empty string for undefined", () => {
      expect(getTimeAgo(undefined as unknown as Date)).toBe("");
    });
  });

  // ── Just now (< 5 seconds) ─────────────────────────────────────────────────

  describe("just now", () => {
    it("returns 'just now' when 0 seconds ago", () => {
      expect(getTimeAgo(secondsAgo(0))).toBe("just now");
    });

    it("returns 'just now' when 4 seconds ago", () => {
      expect(getTimeAgo(secondsAgo(4))).toBe("just now");
    });

    it("returns 'just now' when exactly 5 seconds ago (boundary — first unit triggers)", () => {
      // 5s hits the [1, "s"] bucket → "5s ago"
      expect(getTimeAgo(secondsAgo(5))).toBe("5s ago");
    });
  });

  // ── Seconds ────────────────────────────────────────────────────────────────

  describe("seconds", () => {
    it("returns seconds when 10 seconds ago", () => {
      expect(getTimeAgo(secondsAgo(10))).toBe("10s ago");
    });

    it("returns seconds when 59 seconds ago", () => {
      expect(getTimeAgo(secondsAgo(59))).toBe("59s ago");
    });
  });

  // ── Minutes ────────────────────────────────────────────────────────────────

  describe("minutes", () => {
    it("returns '1m ago' for 1 minute", () => {
      expect(getTimeAgo(minutesAgo(1))).toBe("1m ago");
    });

    it("returns '30m ago' for 30 minutes", () => {
      expect(getTimeAgo(minutesAgo(30))).toBe("30m ago");
    });

    it("returns '59m ago' for 59 minutes", () => {
      expect(getTimeAgo(minutesAgo(59))).toBe("59m ago");
    });
  });

  // ── Hours ──────────────────────────────────────────────────────────────────

  describe("hours", () => {
    it("returns '1h ago' for 1 hour", () => {
      expect(getTimeAgo(hoursAgo(1))).toBe("1h ago");
    });

    it("returns '12h ago' for 12 hours", () => {
      expect(getTimeAgo(hoursAgo(12))).toBe("12h ago");
    });

    it("returns '23h ago' for 23 hours", () => {
      expect(getTimeAgo(hoursAgo(23))).toBe("23h ago");
    });
  });

  // ── Days ───────────────────────────────────────────────────────────────────

  describe("days", () => {
    it("returns '1d ago' for 1 day", () => {
      expect(getTimeAgo(daysAgo(1))).toBe("1d ago");
    });

    it("returns '3d ago' for 3 days", () => {
      expect(getTimeAgo(daysAgo(3))).toBe("3d ago");
    });

    it("returns '6d ago' for 6 days", () => {
      expect(getTimeAgo(daysAgo(6))).toBe("6d ago");
    });
  });

  // ── Weeks ──────────────────────────────────────────────────────────────────

  describe("weeks", () => {
    it("returns '1w ago' for 1 week", () => {
      expect(getTimeAgo(weeksAgo(1))).toBe("1w ago");
    });

    it("returns '2w ago' for 2 weeks", () => {
      expect(getTimeAgo(weeksAgo(2))).toBe("2w ago");
    });

    it("returns '3w ago' for 3 weeks (< 1 month)", () => {
      expect(getTimeAgo(weeksAgo(3))).toBe("3w ago");
    });
  });

  // ── Months ─────────────────────────────────────────────────────────────────

  describe("months", () => {
    it("returns '1m ago' for 1 month", () => {
      expect(getTimeAgo(monthsAgo(1))).toBe("1m ago");
    });

    it("returns '6m ago' for 6 months", () => {
      expect(getTimeAgo(monthsAgo(6))).toBe("6m ago");
    });

    it("returns '11m ago' for 11 months", () => {
      expect(getTimeAgo(monthsAgo(11))).toBe("11m ago");
    });
  });

  // ── Years ──────────────────────────────────────────────────────────────────

  describe("years", () => {
    it("returns '1y ago' for 1 year", () => {
      expect(getTimeAgo(yearsAgo(1))).toBe("1y ago");
    });

    it("returns '2y ago' for 2 years", () => {
      expect(getTimeAgo(yearsAgo(2))).toBe("2y ago");
    });

    it("returns '10y ago' for 10 years", () => {
      expect(getTimeAgo(yearsAgo(10))).toBe("10y ago");
    });
  });

  // ── Accepts string dates ───────────────────────────────────────────────────

  describe("accepts ISO date strings (via new Date(time))", () => {
    it("handles an ISO string from 1 hour ago", () => {
      const isoString = new Date(Date.now() - 3600 * 1000).toISOString();
      expect(getTimeAgo(isoString as unknown as Date)).toBe("1h ago");
    });
  });
});
