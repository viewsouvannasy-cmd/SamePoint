import { z } from "zod";

const tokenSchema = z.string().min(1);

export default tokenSchema;
