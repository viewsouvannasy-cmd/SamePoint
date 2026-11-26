import { Router } from "express";

// controllers
import {
  getUserInfo,
  getUserProfile,
} from "../controllers/user/user-controller.js";

const route = Router();

route.get("/", getUserInfo);
route.get("/profile", getUserProfile);

export default route;
