import { NextFunction, Response, Request } from "express";
import { getEnv } from "../utils/getEnv.js";

const errorHandler = async (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(err);

  res.status(500).json({
    ok: false,
    msg:
      getEnv("NODE_ENV") === "production"
        ? "Internal Server Error"
        : err.message,
    data: "",
  });
};

export default errorHandler;
