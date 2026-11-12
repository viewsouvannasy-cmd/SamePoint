// library
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";

// config
import client from "../../configs/google-client.js";

// validation
import tokenSchema from "../../validation/headerToken-valid.js";

// query
import {
  createNewUser,
  updateRefreshToken,
  findUserByEmail,
} from "./oauth-query.js";

// utils
import { getEnv } from "../../utils/getEnv.js";
import { generateUserSeed } from "../../utils/generate/generate.js";
import {
  generateAccessTokenForMobile,
  generateRefreshTokenForMobile,
} from "../../utils/generate/generateToken.js";

const googleResigterMobile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parse = tokenSchema.safeParse(req.token);

    if (!parse.success) {
      return res
        .status(400)
        .json({ ok: false, msg: parse.error.issues, data: [] });
    }

    const { data: token } = parse;

    // parse token to get user google account info
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: [
        getEnv("GOOGLE_CLIENT_WEB_ID"),
        getEnv("GOOGLE_CLIENT_IOS_ID"),
      ],
    });
    const paylaod = ticket.getPayload();

    if (!paylaod?.email) {
      return res
        .status(400)
        .json({ ok: false, msg: "Invalid Email", data: [] });
    }

    const [findExistUser] = await findUserByEmail(paylaod.email);

    if (findExistUser) {
      const accessToken = generateAccessTokenForMobile(findExistUser.user_id);
      const refreshToken = generateRefreshTokenForMobile(findExistUser.user_id);

      const hashRefreshToken = await bcrypt.hash(refreshToken, 10);
      await updateRefreshToken(
        "mobile",
        hashRefreshToken,
        findExistUser.user_id,
      );

      return res.status(201).json({
        ok: true,
        msg: "LogIn With Google Success",
        data: [{ accessToken, refreshToken }],
      });
    }

    let userName = paylaod.name;

    if (!userName) {
      const index = paylaod.email.indexOf("@");
      userName = paylaod.email.slice(0, index);
    }

    const seed = generateUserSeed(userName);

    const [newUser] = await createNewUser({
      user_name: userName,
      user_email: paylaod.email,
      avatar_seed: seed,
      is_active: true,
      provider: "google",
    });

    // generate token
    const accessToken = generateAccessTokenForMobile(newUser.user_id);
    const refreshToken = generateRefreshTokenForMobile(newUser.user_id);

    // hash refresh token for mobile and save it to the database
    const hashRefreshToken = await bcrypt.hash(refreshToken, 10);
    await updateRefreshToken("mobile", hashRefreshToken, newUser.user_id);

    res.status(201).json({
      ok: true,
      msg: "SignIn With Google Success",
      data: [{ accessToken, refreshToken }],
    });
  } catch (error) {
    next(error);
  }
};

export { googleResigterMobile };
