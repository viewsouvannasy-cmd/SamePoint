import { vi } from "vitest";

vi.mock("../src/config/database.js", () => ({
  read_sql: vi.fn(),
  write_sql: vi.fn(),
  connectDB: vi.fn(),
}));
