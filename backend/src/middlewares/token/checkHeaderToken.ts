import { Request, Response, NextFunction } from "express";

const checkHeaderToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res
      .status(400)
      .json({ ok: false, msg: "Header Should Not Empty", data: [] });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res
      .status(401)
      .json({ ok: false, msg: "Invalid Authorization Header", data: [] });
  }

  req.token = token;
  next();
};

export default checkHeaderToken;
