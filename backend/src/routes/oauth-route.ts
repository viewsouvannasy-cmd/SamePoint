import { Router } from "express";

// middleware
import checkHeaderToken from "../middlewares/token/checkHeaderToken.js";

// controller
import { googleResigterMobile } from "../controllers/oauth/oauth-controller-mobile.js";

const route = Router();

route.get("/google/mobile", checkHeaderToken, googleResigterMobile);

export default route;
