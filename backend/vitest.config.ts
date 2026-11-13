import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true, // lets you use describe/it/expect without imports
    include: ["test/**/*.test.ts"],
  },
});
