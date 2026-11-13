import { describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import request from "supertest";

import notFoundHandler from "../../src/middlewares/notFoundHandler";
import app from "../../src/app";

describe("notFoundHandler", () => {
  it("responds 404 with the missing url", () => {
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    const req = { url: "/missing" } as Request;
    const res = { status } as unknown as Response;

    notFoundHandler(req, res);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({
      ok: false,
      msg: "This /missing URL Is Not Found",
    });
  });

  it("handles unknown routes on the app", async () => {
    const res = await request(app).get("/this-route-does-not-exist");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      ok: false,
      msg: "This /this-route-does-not-exist URL Is Not Found",
    });
  });
});
