import { Router } from "express";

const route = Router();

// middleware
import checkHeaderToken from "../middlewares/token/checkHeaderToken.js";

// comtrollers
import refreshToken from "../controllers/refresh-token-controller.js";

route.get("/:platform", checkHeaderToken, refreshToken);

export default route;
