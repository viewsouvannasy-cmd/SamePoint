import z from "zod";

export const validPlatform = z.enum(["mobile", "web"]);
