// library
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// helper function
import { getEnv } from "../utils/getEnv.js";
import { generateAccessTokenForMobile } from "../utils/generate/generateToken.js";
import { findUserById } from "../utils/query/findUser.js";

// validation
import { validToken } from "../validation/common.js";
import platformSehema from "../validation/refresh-token-valid.js";

// type
import type { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "jsonwebtoken";

// this refresh token function handle include web and mobile
const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parse = validToken.safeParse(req.token);
    const parseQueryString = platformSehema.safeParse(req.params);

    if (!parse.success) {
      return res
        .status(401)
        .json({ ok: false, msg: parse.error.issues[0].message, data: [] });
    }

    if (!parseQueryString.success) {
      return res.status(401).json({
        ok: false,
        msg: parseQueryString.error.issues[0].message,
        data: [],
      });
    }

    const token = parse.data;
    const { platform } = parseQueryString.data;

    const payload = jwt.verify(
      token,
      getEnv("REFRESH_TOKEN_SECRET"),
    ) as JwtPayload;

    // find user in the database
    const [findUser] = await findUserById(payload.user_id);

    if (!findUser) {
      return res
        .status(401)
        .json({ ok: false, msg: "User Is Not Found", data: [] });
    }

    const compareHash =
      platform === "mobile"
        ? // compare hash refresh token mobile
          await bcrypt.compare(token, findUser.refresh_token_mobile)
        : // compare hash refresh token web
          await bcrypt.compare(token, findUser.refresh_token_web);

    if (!compareHash) {
      return res
        .status(401)
        .json({ ok: false, msg: "Invalid Token", data: [] });
    }

    const accessToken =
      platform === "mobile"
        ? generateAccessTokenForMobile(payload.user_id)
        : ""; // this be will token for web in the futher

    res.status(201).json({
      ok: true,
      msg: "Generate New Access Token Success",
      data: [{ accessToken }],
    });
  } catch (error) {
    next(error);
  }
};

export default refreshToken;
