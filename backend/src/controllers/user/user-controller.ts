// query
import { getUserData } from "./user-query.js";

// validation
import { getUserInfoSehema } from "../../validation/user-valid.js";
import { findUserById } from "../../utils/query/findUser.js";

// types
import type { Request, Response, NextFunction } from "express";

const getUserInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parse = getUserInfoSehema.safeParse(req.body);

    if (!parse.success) {
      return res
        .status(401)
        .json({ ok: false, msg: parse.error.issues[0].message, data: [] });
    }

    const { user_id } = parse.data;

    const [findUser] = await findUserById(user_id);

    if (!findUser) {
      return res
        .status(401)
        .json({ ok: false, msg: "User Is Not Found", data: [] });
    }

    const userData = await getUserData(user_id);

    res.status(200).json({ ok: true, msg: "Success", data: userData });
  } catch (error) {
    next(error);
  }
};

export { getUserInfo };
