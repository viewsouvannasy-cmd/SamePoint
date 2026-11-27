import z from "zod";

import { numberId } from "./common.js";

export const getUserInfoSchema = z.object({
  user_id: numberId,
});

export const changeUserNameSchema = z.object({
  user_id: numberId,
  new_name: z
    .string({ error: "Please provide your new name" })
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(30, "Name must be at most 30 characters"),
});
