// query
import { getUserData, readUserProfile } from "./user-query.js";

// validation
import { getUserInfoSchema } from "../../validation/user-valid.js";

// types
import type { Request, Response, NextFunction } from "express";

const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parse = getUserInfoSchema.safeParse(req.body);
    if (!parse.success) {
      return res
        .status(401)
        .json({ ok: false, msg: parse.error.issues[0].message, data: [] });
    }

    const { user_id } = parse.data;

    const userProfile = await readUserProfile(user_id);

    if (userProfile.length === 0) {
      return res
        .status(401)
        .json({ ok: false, msg: "User Is Not Found", data: [] });
    }

    res.status(200).json({ ok: true, msg: "Success", data: userProfile });
  } catch (error) {
    next(error);
  }
};

const getUserInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parse = getUserInfoSchema.safeParse(req.body);

    if (!parse.success) {
      return res
        .status(401)
        .json({ ok: false, msg: parse.error.issues[0].message, data: [] });
    }

    const { user_id } = parse.data;

    const userData = await getUserData(user_id);

    if (userData.length === 0) {
      return res
        .status(401)
        .json({ ok: false, msg: "User Is Not Found", data: [] });
    }

    res.status(200).json({ ok: true, msg: "Success", data: userData });
  } catch (error) {
    next(error);
  }
};

export { getUserInfo, getUserProfile };
