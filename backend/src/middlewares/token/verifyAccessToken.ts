import jwt from "jsonwebtoken";

// utils
import { getEnv } from "../../utils/getEnv.js";

// types
import type { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "jsonwebtoken";

const verifyAccessToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      ok_verify_token: false,
      msg: "no have token provided",
      data: "",
    });
  }
  const token = authHeader.split(" ")[1];

  if (!token || token === "null" || token === "undefined") {
    return res.status(401).json({
      ok_verify_token: false,
      msg: "TOKEN_MISSING",
      data: "",
    });
  }

  try {
    const payload = jwt.verify(
      token,
      getEnv("ACCESS_TOKEN_SECRET"),
    ) as JwtPayload;
    req.body = {
      ...req.body,
      user_id: payload.user_id,
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      // console.log(error.name, error.message);
      return res.status(401).json({
        ok_verify_token: false,
        msg: "TOKEN_EXPIRED",
        data: "",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      // console.log(error.name, error.message);
      return res.status(401).json({
        ok_verify_token: false,
        msg: "TOKEN_INVALID",
        data: "",
      });
    }

    return next(error);
  }
};

export default verifyAccessToken;
