import z from "zod";

const platformSchema = z.object({
  platform: z.enum(["mobile", "web"]),
});

export default platformSchema;
