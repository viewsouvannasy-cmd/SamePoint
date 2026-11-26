import { read_sql } from "../../configs/database.js";

// types
import type { User } from "../../types/query.js";

export const getUserData = async (user_id: number) => {
  return (await read_sql`           
        SELECT 
            user_name,
            user_email,
            avatar_seed,
            profile_url,
            (
                SELECT 
                count(*)
                FROM members 
                WHERE user_id = ${user_id} AND is_archive_project = TRUE
            ) AS total_archive_project
        FROM users
        WHERE user_id = ${user_id}
        `) as [User] | [];
};

export const readUserProfile = async (user_id: number) => {
  return (await read_sql`
    SELECT 
        avatar_seed,
        profile_url
    FROM users  
    WHERE user_id = ${user_id}
    `) as [{ avatar_seed: string; profile_url: string }] | [];
};
