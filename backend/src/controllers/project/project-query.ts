import { read_sql, write_sql } from "../../configs/database.js";
import type {
  ProjectData,
  TaskDate,
  TotalEachState,
} from "../../types/query.js";

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
        m.is_owner
    FROM projects AS p
    INNER JOIN members AS m 
        ON p.p_id = m.p_id
    INNER JOIN users AS u 
        ON m.user_id = u.user_id
    WHERE m.user_id = ${user_id}
    LIMIT 5
    `) as ProjectData[];
};

export const readMemberSeed = async (projectIdList: number[]) => {
  return (await read_sql`
    WITH CTE_memder_of_each_project AS (
        SELECT 
            p_id,
            user_id
        FROM members 
        WHERE p_id = ANY(${projectIdList}::int[])
    )

    SELECT 
        cte_m.p_id,
        u.avatar_seed
    FROM CTE_memder_of_each_project AS cte_m 
    INNER JOIN users AS u
        ON cte_m.user_id = u.user_id
    `) as { p_id: number; avatar_seed: string }[];
};

export const readTotalTaskOfEachState = async (projectIdList: number[]) => {
  return (await read_sql`
    SELECT 
        p_id,
        current_state,
        COUNT(*)
    FROM tasks 
    WHERE p_id = ANY(${projectIdList}::int[])
    GROUP BY  p_id ,current_state
    `) as TotalEachState[];
};

export const readTaskData = async (projectIdList: number[]) => {
  return (await read_sql`
    WITH CTE_task_runing_number AS (
        SELECT
        p_id,
        m_id,
        jobs,
        current_state,
        create_at,
        ROW_NUMBER() over (PARTITION BY p_id, current_state ORDER BY create_at DESC) AS rn
    FROM tasks
    WHERE p_id = ANY(${projectIdList}::int[])
    )


    SELECT 
        cte_t.p_id,
        u.user_name,
        m.position,
        cte_t.jobs,
        cte_t.current_state,
        cte_t.create_at
    FROM CTE_task_runing_number AS cte_t
    INNER JOIN members AS m 
        ON cte_t.m_id = m.m_id 
    INNER JOIN users AS u 
        ON m.user_id = u.user_id
    WHERE cte_t.rn <= 2
    `) as TaskDate[];
};
