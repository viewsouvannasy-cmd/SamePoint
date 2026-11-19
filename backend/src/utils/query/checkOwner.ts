import { read_sql } from "../../configs/database.js";

export const isProjectOwner = async (
  user_id: number,
  p_id: number,
): Promise<boolean> => {
  const result = await read_sql`
    SELECT 
        p_id
    FROM projects 
    WHERE user_id = ${user_id}
        AND p_id = ${p_id}
    `;

  return result.length === 0;
};
