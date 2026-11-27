// library
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// validation
import { validToken } from "../../validation/common.js";

// query
import { findUserById } from "../../utils/query/findUser.js";
import { updateRefreshToken } from "../../utils/query/update.js";

// untils
import { getEnv } from "../../utils/getEnv.js";

// types
import type { JwtPayload } from "jsonwebtoken";

const handleLogOutMobile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parse = validToken.safeParse(req.token);

    if (!parse.success) {
      return res.status(400).json({
        ok: false,
        msg: parse.error.issues[0].message,
        data: [],
      });
    }

    const token = parse.data;

    // verify token
    const paylaod = jwt.verify(
      token,
      getEnv("REFRESH_TOKEN_SECRET"),
    ) as JwtPayload;

    // find user in the database
    const [findUser] = await findUserById(paylaod.user_id);
    if (!findUser) {
      return res
        .status(401)
        .json({ ok: false, msg: "User not found", data: [] });
    }

    // compare hash refresh token mobile
    const compareRefreshToken = await bcrypt.compare(
      token,
      findUser.refresh_token_mobile,
    );
    if (!compareRefreshToken) {
      return res
        .status(401)
        .json({ ok: false, msg: "Invalid token", data: [] });
    }

    // set refresh token mobile to null in the database
    await updateRefreshToken("mobile", null, paylaod.user_id);

    res.status(202).json({ ok: true, msg: "Log out success", data: [] });
  } catch (error) {
    next(error);
  }
};

export { handleLogOutMobile };
