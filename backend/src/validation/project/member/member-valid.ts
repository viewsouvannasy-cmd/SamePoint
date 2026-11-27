import z from "zod";

import { numberId } from "../../common.js";

export const acceptMemberSchema = z.object({
  user_id: numberId,
  p_id: numberId,
  position: z
    .string({
      error: "Position must be a string",
    })
    .trim()
    .min(1, "Position cannot be empty")
    .max(100, "Position must be at most 100 characters"),
});
