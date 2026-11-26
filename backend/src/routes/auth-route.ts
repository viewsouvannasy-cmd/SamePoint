// library
import { Router } from "express";

// controllers
import { isUserLogin } from "../controllers/auth/auth-controller-mobile.js";
import { handleLogOutMobile } from "../controllers/auth/auth-controller-mobile.js";
// middleware
import checkHeaderToken from "../middlewares/token/checkHeaderToken.js";

const route = Router();

route.get("/mobile/logout", checkHeaderToken, handleLogOutMobile);
route.get("/mobile/is-login", checkHeaderToken, isUserLogin);

export default route;
