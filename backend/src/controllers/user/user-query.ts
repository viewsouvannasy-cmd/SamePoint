import { read_sql } from "../../configs/database.js";

// types
import type { User } from "../../types/query.js";

export const getUserData = async (user_id: number) => {
  return (await read_sql`
            SELECT 
                user_name,
                user_email,
                avatar_seed,
                is_active,
                create_at
            FROM users 
            WHERE user_id = ${user_id}
            `) as [User];
};
