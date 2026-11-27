// query
import { getUserData, readUserProfile, updateUserName } from "./user-query.js";

// validation
import {
  getUserInfoSchema,
  changeUserNameSchema,
} from "../../validation/user-valid.js";

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

const changeUserName = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parse = changeUserNameSchema.safeParse(req.body);

    if (!parse.success) {
      const error = parse.error.issues[0];
      return res.status(400).json({
        ok: false,
        msg: {
          point: error.path[0],
          content: error.message,
        },
        data: [],
      });
    }

    const { user_id, new_name } = parse.data;

    const [updateName] = await updateUserName(user_id, new_name);
    if (!updateName) {
      return res
        .status(401)
        .json({ ok: false, msg: "User is not found", data: [] });
    }

    res
      .status(202)
      .json({ ok: true, msg: "Update user name success", data: [] });
  } catch (error) {
    next(error);
  }
};

export { getUserInfo, getUserProfile, changeUserName };
