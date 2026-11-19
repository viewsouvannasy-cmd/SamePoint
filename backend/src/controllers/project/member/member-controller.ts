//  query
import { writeNewMember } from "./member-query.js";

// validation
import { acceptMemberSchema } from "../../../validation/project/member/member-valid.js";

// types
import type { Request, Response, NextFunction } from "express";

const acceptInvitedMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parse = acceptMemberSchema.safeParse(req.body);

    if (!parse.success) {
      return res
        .status(400)
        .json({ ok: false, msg: parse.error.issues[0].message, data: [] });
    }

    const { user_id, p_id, position } = parse.data;

    await writeNewMember(p_id, user_id, position, false);

    res.status(201).json({ ok: true, msg: "You accept invited", data: [] });
  } catch (error) {
    next(error);
  }
};

export { acceptInvitedMember };
