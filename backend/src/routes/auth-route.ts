// library
import { Router } from "express";

// controllers

import { handleLogOutMobile } from "../controllers/auth/auth-controller-mobile.js";
// middleware
import checkHeaderToken from "../middlewares/token/checkHeaderToken.js";

const route = Router();

route.get("/mobile/logout", checkHeaderToken, handleLogOutMobile);

export default route;
