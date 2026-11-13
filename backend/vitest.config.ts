import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["test/setup.ts"],
    globals: true,
    include: ["test/**/*.test.ts"],
    env: {
      DATABASE_WRITE_URL: "postgresql://user:pass@localhost/db",
      DATABASE_READ_URL: "postgresql://user:pass@localhost/db",
      ACCESS_TOKEN_SECRET: "test-access-secret",
      REFRESH_TOKEN_SECRET: "test-refresh-token",
      NODE_ENV: "test",
      GOOGLE_CLIENT_WEB_ID: "web-id",
      GOOGLE_CLIENT_IOS_ID: "ios-id",
    },
  },
});
