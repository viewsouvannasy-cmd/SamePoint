import { Router } from "express";

// controllers
import { getUserInfo } from "../controllers/user/user-controller.js";

const route = Router();

route.get("/", getUserInfo);

export default route;
