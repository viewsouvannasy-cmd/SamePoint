import { read_sql } from "../../configs/database.js";

export const findUserById = async (
  user_id: number,
): Promise<
  [{ refresh_token_mobile: string; refresh_token_web: string }] | []
> => {
  return (await read_sql`
    SELECT 
        refresh_token_mobile,
        refresh_token_web
    FROM users 
    WHERE user_id = ${user_id}
    `) as [{ refresh_token_mobile: string; refresh_token_web: string }] | [];
};
