import { describe, expect, it } from "vitest";
import jwt, { type JwtPayload } from "jsonwebtoken";
import {
  generateAccessTokenForMobile,
  generateRefreshTokenForMobile,
} from "../../../src/utils/generate/generateToken.js";

describe("generateToken", () => {
  describe("generateAccessTokenForMobile", () => {
    it("signs a JWT with ACCESS_TOKEN_SECRET containing user_id and 30m expiration", () => {
      const token = generateAccessTokenForMobile(42);
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string,
      ) as JwtPayload;

      expect(decoded.user_id).toBe(42);
      expect(decoded.exp! - decoded.iat!).toBe(30 * 60);
    });
  });

  describe("generateRefreshTokenForMobile", () => {
    it("signs a JWT with REFRESH_TOKEN_SECRET containing user_id and 90d expiration", () => {
      const token = generateRefreshTokenForMobile(99);
      const decoded = jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET as string,
      ) as JwtPayload;

      expect(decoded.user_id).toBe(99);
      expect(decoded.exp! - decoded.iat!).toBe(90 * 24 * 60 * 60);
    });
  });
});
