import { Request, Response } from "express";

const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ ok: false, msg: `This ${req.url} URL Is Not Found` });
};

export default notFoundHandler;
