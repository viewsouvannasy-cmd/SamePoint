import z from "zod";
import { numberId } from "../common.js";

export const createProjectSchema = z.object({
  user_id: numberId,
  project_name: z
    .string({ error: "Project name is required" })
    .trim()
    .min(5, "Name must be at least 5 characters")
    .max(40, "Name must be at most 40 characters"),
  describe: z
    .string()
    .trim()
    .max(255, "Description must be at most 255 characters")
    .optional()
    .default(""),
});

export const archiveProjectSchema = z.object({
  user_id: numberId,
  archive: z.boolean({ error: "Please provide required" }),
});

export const searchProjectSchema = z.object({
  user_id: numberId,
  search: z.string().trim().toLowerCase(),
});
