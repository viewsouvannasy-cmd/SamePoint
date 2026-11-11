import jwt from "jsonwebtoken";

import { getEnv } from "../getEnv.js";

export function generateAccessTokenForMobile(user_id: number): string {
  return jwt.sign({ user_id }, getEnv("ACCESS_TOKEN_SECRET"), {
    expiresIn: "30m",
  });
}

export function generateRefreshTokenForMobile(user_id: number): string {
  return jwt.sign({ user_id }, getEnv("REFRESH_TOKEN_SECRET"), {
    expiresIn: "90d",
  });
}
