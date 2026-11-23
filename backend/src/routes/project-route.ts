import { Router } from "express";

// controllers
import {
  createProject,
  getProjectList,
  searchProject,
  switchArchiveProject,
  updateProject,
} from "../controllers/project/project-controller.js";

const route = Router();

route.get("/", getProjectList);

route.post("/", createProject);
route.post("/search", searchProject);

route.put("/:p_id", updateProject);
route.put("/:p_id/archive", switchArchiveProject);

export default route;
