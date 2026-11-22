import { write_sql } from "../../../configs/database.js";

export const writeNewMember = async (
  p_id: number,
  user_id: number,
  position: string,
  is_owner: boolean,
): Promise<void> => {
  await write_sql`
    INSERT INTO members (p_id, user_id, position, is_owner)
    VALUES (
    ${p_id},
    ${user_id},
    ${position},
    ${is_owner}
    )
    `;
};
