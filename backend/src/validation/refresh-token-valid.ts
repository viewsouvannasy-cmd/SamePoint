import z from "zod";

import { validPlatform } from "./enums.js";

const platformSchema = z.object({
  platform: validPlatform,
});

export default platformSchema;
