import { read_sql, write_sql } from "../../configs/database.js";
import { ProjectData, TaskDate } from "../../types/query.js";

export const writeNewProject = async (
  project_name: string,
  describe: string,
) => {
  return (await write_sql`
    INSERT INTO projects (project_name, describe)
    VALUES (
    ${project_name},
    ${describe}
    )
    RETURNING p_id
    `) as { p_id: number }[];
};

export const readProjectList = async (user_id: number) => {
  return (await read_sql`
    SELECT 
        p.p_id,
        p.project_name,
        p.describe,
        m.is_owner,
        u.avatar_seed
    FROM projects AS p
    INNER JOIN members AS m 
        ON p.p_id = m.p_id
    INNER JOIN users AS u 
        ON m.user_id = u.user_id
    WHERE p.p_id IN (
                    SELECT
                        p_id
                    FROM members
                    WHERE user_id = ${user_id}
                    )
        AND m.is_archive_project = FALSE
    LIMIT 6
    `) as ProjectData[];
};

export const readTaskData = async (user_id: number) => {
  return (await read_sql`
    SELECT 
        t.t_id,
        t.p_id,
        t.m_id,
        u.user_name,
        m.position,
        t.jobs,
        t.current_state,
        t.create_at
    FROM tasks AS t
    INNER JOIN members AS m 
        ON t.m_id = m.m_id 
    INNER JOIN users AS u 
        ON m.user_id = u.user_id
    WHERE t.p_id IN (
                    SELECT
                    p_id
                    FROM members
                    WHERE user_id = ${user_id}
                    )
    `) as TaskDate[];
};
