import { describe, expect, it } from "vitest";
import request from "supertest";

import app from "../src/app";

describe("/health", () => {
  it("return ok with status 200", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("ok");
  });
});
