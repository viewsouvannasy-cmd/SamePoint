import z from "zod";

import { validPlatform } from "./enums.js";
import { validToken } from "./common.js";

const refreshTokenSchema = z.object({
  token: validToken,
  platform: validPlatform,
});

export default refreshTokenSchema;
