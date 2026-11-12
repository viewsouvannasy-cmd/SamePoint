import { read_sql, write_sql } from "../../configs/database.js";

interface CreateNewUser {
  user_name: string;
  user_email: string;
  avatar_seed: string;
  is_active: boolean;
  provider: string;
}

const createNewUser = async ({
  user_name,
  user_email,
  avatar_seed,
  is_active,
  provider,
}: CreateNewUser): Promise<[{ user_id: number }]> => {
  return (await write_sql`
    INSERT INTO users (user_name, user_email, avatar_seed, is_active, provider)
    VALUES (
    ${user_name},
    ${user_email},
    ${avatar_seed},
    ${is_active},
    ${provider}
    )
    RETURNING user_id
    `) as [{ user_id: number }];
};

const updateRefreshToken = async (
  platform: "web" | "mobile",
  hash_token: string,
  user_id: number,
) => {
  if (platform === "web") {
    await write_sql`
    UPDATE users 
    SET refresh_token_web = ${hash_token}
    WHERE user_id = ${user_id}
    `;
  } else {
    await write_sql`
    UPDATE users 
    SET refresh_token_mobile = ${hash_token}
    WHERE user_id = ${user_id}
    `;
  }
};

const findUserByEmail = async (
  user_email: string,
): Promise<[{ user_id: number }] | []> => {
  return (await read_sql`
    SELECT 
      user_id
    FROM users 
    WHERE user_email = ${user_email}
    `) as [{ user_id: number }];
};

export { createNewUser, updateRefreshToken, findUserByEmail };
