import z from "zod";
import { numberId } from "../user-valid.js";

export const createProjectSchema = z.object({
  user_id: numberId,
  project_name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be at most 100 characters"),
  describe: z
    .string()
    .trim()
    .max(1000, "Description must be at most 1000 characters")
    .optional()
    .default(""),
});
