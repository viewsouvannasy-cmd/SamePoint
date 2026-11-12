import { NextFunction, Response, Request } from "express";

import { getEnv } from "../utils/getEnv.js";

const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.log(err);

  res.status(500).json({
    ok: false,
    msg: getEnv("NODE_ENV") === "development" ? err : "Internal Server Error",
    data: [],
  });
};

export default errorHandler;
