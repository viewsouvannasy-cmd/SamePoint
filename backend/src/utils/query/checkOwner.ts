import { read_sql } from "../../configs/database.js";

export const isProjectOwner = async (
  user_id: number,
  p_id: number,
): Promise<boolean> => {
  const [result] = (await read_sql`
    SELECT 
    is_owner
    FROM members 
    WHERE p_id = ${p_id} AND user_id = ${user_id}
    `) as { is_owner: boolean }[];

  if (!result) {
    return false;
  }

  return result.is_owner;
};
