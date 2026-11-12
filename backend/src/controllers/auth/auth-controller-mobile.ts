// library
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// validation
import tokenSchema from "../../validation/headerToken-valid.js";

// query
import { findUserById } from "../../utils/query/findUser.js";

// untils
import { getEnv } from "../../utils/getEnv.js";
import { generateAccessTokenForMobile } from "../../utils/generate/generateToken.js";

// types
import type { JwtPayload } from "jsonwebtoken";

const isUserLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parse = tokenSchema.safeParse(req.token);

    if (!parse.success) {
      return res
        .status(400)
        .json({ ok: false, msg: parse.error.issues, data: [] });
    }

    const { data: token } = parse;

    // verify user token
    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, getEnv("REFRESH_TOKEN_SECRET")) as JwtPayload;
    } catch {
      return res
        .status(401)
        .json({ ok: false, msg: "Token Invalid", data: [] });
    }

    console.log(payload);

    //  find user in the data
    const findUser = await findUserById(payload.user_id);

    if (findUser.length === 0) {
      return res
        .status(401)
        .json({ ok: false, msg: "User Is Not Found", data: [] });
    }

    // compare hash refesh token mobile
    const compareRefreshToken = await bcrypt.compare(
      token,
      findUser[0].refresh_token_mobile,
    );

    if (!compareRefreshToken) {
      return res
        .status(401)
        .json({ ok: false, msg: "Token Invalid", data: [] });
    }

    const accessToken = generateAccessTokenForMobile(payload.user_id);

    res
      .status(200)
      .json({ ok: true, msg: "User Is Login", data: [{ accessToken }] });
  } catch (error) {
    next(error);
  }
};

export { isUserLogin };
