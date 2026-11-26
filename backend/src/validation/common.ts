import z from "zod";

export const numberId = z
  .number("Invalid id")
  .int("Invalid id")
  .positive("Invalid id");

export const validToken = z.string().min(1);
