import { Request, Response, NextFunction } from "express";

import { sql } from "../config/database.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

export const SignupAndLoginWithEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user_email } = req.body;

    // find user
    const [findUser] = (await sql`
    SELECT 
    user_id 
    FROM users
    WHERE user_email = ${user_email}
    `) as { user_id: number }[];
    if (!findUser) {
      res.status(401).json({ ok: false, msg: "user is not found", data: "" });
    }

    const accessToken = generateAccessToken(findUser.user_id);
    const refreshToken = generateRefreshToken(findUser.user_id);

    res.status(200).json({
      ok: true,
      msg: "Login Success",
      data: { accessToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
};
