import z from "zod";

export const numberId = z
  .number("Invalid id")
  .int("Invalid id")
  .positive("Invalid id");

export const getUserInfoSchema = z.object({
  user_id: numberId,
});
