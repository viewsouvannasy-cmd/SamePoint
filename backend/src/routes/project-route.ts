import { Router } from "express";

// controllers
import {
  createProject,
  getProjectList,
  switchArchiveProject,
  updateProject,
} from "../controllers/project/project-controller.js";

const route = Router();

route.get("/", getProjectList);
route.post("/", createProject);
route.put("/:p_id", updateProject);
route.put("/:p_id/archive", switchArchiveProject);

export default route;
