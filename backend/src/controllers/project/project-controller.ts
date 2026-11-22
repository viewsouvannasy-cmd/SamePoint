import { Request, Response, NextFunction } from "express";

// query
import {
  readMemberSeed,
  readProjectList,
  readTaskData,
  readTotalTaskOfEachState,
  writeNewProject,
} from "./project-query.js";
import { writeNewMember } from "./member/member-query.js";

// utils
import { formatProjectData } from "../../utils/project/format.js";

// validation
import { createProjectSchema } from "../../validation/project/project-valid.js";
import { getUserInfoSchema } from "../../validation/user-valid.js";

const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const parse = createProjectSchema.safeParse(req.body);
  if (!parse.success) {
    const error = parse.error.issues[0];
    return res.status(400).json({
      ok: false,
      msg: { point: error.path[0], content: error.message },
      data: [],
    });
  }

  const { user_id, project_name, describe } = parse.data;

  const [newProject] = await writeNewProject(project_name, describe);

  await writeNewMember(newProject.p_id, user_id, "admin", true);

  res.status(201).json({ ok: true, msg: "Create project success", data: [] });
  try {
    console.log("");
  } catch (error) {
    next(error);
  }
};

const getProjectList = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parse = getUserInfoSchema.safeParse(req.body);

    if (!parse.success) {
      return res
        .status(400)
        .json({ ok: false, msg: parse.error.issues[0].message, data: [] });
    }

    const { user_id } = parse.data;

    // get project data
    const projectData = await readProjectList(user_id);

    // map project id
    const projectIdList = projectData.map((item) => item.p_id);

    const [memberSeed, totalEachState, taskData] = await Promise.all([
      // get member seed
      readMemberSeed(projectIdList),
      // get total of each state
      readTotalTaskOfEachState(projectIdList),
      // get task data
      readTaskData(projectIdList),
    ]);

    // format the data
    const dataWithFormat = formatProjectData(
      projectData,
      memberSeed,
      totalEachState,
      taskData,
    );

    res
      .status(200)
      .json({ ok: true, msg: "Get project list", data: dataWithFormat });
  } catch (error) {
    next(error);
  }
};

export { createProject, getProjectList };
