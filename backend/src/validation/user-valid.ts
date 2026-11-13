import z from "zod";

export const getUserInfoSehema = z.object({
  user_id: z.number().int().positive(),
});
