import { Router } from "express";

import { SignupAndLoginWithEmail } from "../controllers/auth-controller.js";

const route = Router();

route.post("/signup-login", SignupAndLoginWithEmail);

export default route;
