import z from "zod";

import { numberId } from "./common.js";

export const getUserInfoSchema = z.object({
  user_id: numberId,
});
