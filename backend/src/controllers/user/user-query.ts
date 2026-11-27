import { read_sql, write_sql } from "../../configs/database.js";

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

export const updateUserName = async (user_id: number, new_name: string) => {
  return (await write_sql`
    UPDATE users 
    SET user_name = ${new_name}
    WHERE user_id = ${user_id}
    RETURNING user_id
    `) as [{ user_id: number }] | [];
};
