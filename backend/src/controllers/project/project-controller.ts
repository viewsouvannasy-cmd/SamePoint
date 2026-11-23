// query
import {
  readMemberSeed,
  readProjectList,
  readTaskData,
  readTotalTaskOfEachState,
  searchProjectList,
  writeNewProject,
  writeUpdateArchiveProject,
  writeUpdateProject,
} from "./project-query.js";
import { writeNewMember } from "./member/member-query.js";

// utils
import { formatProjectData } from "../../utils/project/format.js";
import { isProjectOwner } from "../../utils/query/checkOwner.js";
import { isUserMember } from "../../utils/query/checkValid.js";

// validation
import {
  archiveProjectSchema,
  createProjectSchema,
  searchProjectSchema,
} from "../../validation/project/project-valid.js";
import { getUserInfoSchema } from "../../validation/user-valid.js";

// type
import type { Request, Response, NextFunction } from "express";

const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
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

const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parse = createProjectSchema.safeParse(req.body);
    if (!parse.success) {
      const error = parse.error.issues[0];
      return res.status(400).json({
        ok: false,
        msg: { point: error.path[0], content: error.message },
        data: [],
      });
    }

    const { p_id } = req.params;
    const projectId = Number(p_id);
    const { user_id, project_name, describe } = parse.data;

    const isOwner = await isProjectOwner(user_id, projectId);
    if (!isOwner) {
      return res.status(401).json({
        ok: false,
        msg: "You are not be able to edit this project",
        data: [],
      });
    }

    await writeUpdateProject(projectId, project_name, describe);

    res.status(202).json({ ok: true, msg: "Update project success", data: [] });
  } catch (error) {
    next(error);
  }
};

// const deleteProject = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const parse = numberId.safeParse(req.body.user_id);

//     if (!parse.success) {
//       return res
//         .status(400)
//         .json({ ok: false, msg: parse.error.issues[0].message, data: [] });
//     }

//     const user_id = parse.data;
//     const { p_id } = req.params;
//     const projectId = Number(p_id);

//     const isOwner = await isProjectOwner(user_id, projectId);
//     if (!isOwner) {
//       return res.status(401).json({
//         ok: false,
//         msg: "You are not be able to delete this project",
//         data: [],
//       });
//     }
//   } catch (error) {
//     next(error);
//   }
// };

const switchArchiveProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parse = archiveProjectSchema.safeParse(req.body);

    if (!parse.success) {
      return res
        .status(400)
        .json({ ok: false, msg: parse.error.issues[0].message, data: [] });
    }

    const { user_id, archive } = parse.data;
    const { p_id } = req.params;
    const projectId = Number(p_id);

    const isMember = await isUserMember(projectId, user_id);
    if (!isMember) {
      return res.status(401).json({
        ok: false,
        msg: "You are not a member",
        data: [],
      });
    }

    await writeUpdateArchiveProject(isMember.m_id, archive);

    res.status(202).json({ ok: true, msg: "Switch archive success", data: [] });
  } catch (error) {
    next(error);
  }
};

const searchProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parse = searchProjectSchema.safeParse(req.body);
    if (!parse.success) {
      return res
        .status(400)
        .json({ ok: false, msg: parse.error.issues[0].message, data: [] });
    }

    const { user_id, search } = parse.data;

    if (search === "") {
      res.status(200).json({ ok: true, msg: "Search success", data: [] });
    }

    // get project data
    const resultSearch = await searchProjectList(user_id, search);

    // map project id
    const projectIdList = resultSearch.map((item) => item.p_id);

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
      resultSearch,
      memberSeed,
      totalEachState,
      taskData,
    );

    res
      .status(200)
      .json({ ok: true, msg: "Search success", data: dataWithFormat });
  } catch (error) {
    next(error);
  }
};

export {
  createProject,
  getProjectList,
  updateProject,
  switchArchiveProject,
  searchProject,
};
