import { Router } from "express";

// controllers
import {
  changeUserName,
  getUserInfo,
  getUserProfile,
} from "../controllers/user/user-controller.js";

const route = Router();

route.get("/", getUserInfo);
route.get("/profile", getUserProfile);

route.put("/user-name", changeUserName);

export default route;
