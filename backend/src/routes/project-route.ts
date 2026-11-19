import { Router } from "express";

// controllers
import {
  createProject,
  getProjectList,
} from "../controllers/project/project-controller.js";

const route = Router();

route.get("/", getProjectList);
route.post("/", createProject);

export default route;
