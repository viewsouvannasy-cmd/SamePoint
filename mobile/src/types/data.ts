import type { BaseReponse } from "./response";

export interface User extends BaseReponse {
  data: [
    {
      user_id: number;
      user_name: string;
      user_email: string;
      avatar_seed: string;
      is_active: true;
      create_at: Date;
    },
  ];
}

export interface ProjectDataList extends BaseReponse {
  data: ProjectItemData[];
}

export interface ProjectItemData {
  p_id: number;
  project_name: string;
  describe: string;
  member_seeds: string[];
  new_task: TaskDateList[];
  in_review: TaskDateList[];
  approved: TaskDateList[];
}

export interface TaskDateList {
  t_id: number;
  p_id: number;
  m_id: number;
  user_name: string;
  position: string;
  jobs: string;
  current_state: "new_task" | "in_review" | "approved";
  create_at: Date;
}
