import { read_sql } from "../../configs/database.js";

export const isUserMember = async (
  p_id: number,
  user_id: number,
): Promise<{ m_id: number } | undefined> => {
  const [result] = (await read_sql`
    SELECT 
    m_id
    FROM members
    WHERE p_id = ${p_id} AND user_id = ${user_id}
    `) as { m_id: number }[];

  return result;
};
