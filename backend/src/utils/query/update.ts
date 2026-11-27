import { write_sql } from "../../configs/database.js";

export const updateRefreshToken = async (
  platform: "web" | "mobile",
  hash_token: string | null,
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
