import z from "zod";

const platformSehema = z.object({
  platform: z.enum(["mobile", "web"]),
});

export default platformSehema;
