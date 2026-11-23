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
  new_task: TaskData;
  in_review: TaskData;
  approved: TaskData;
}

export interface TaskData {
  count: number;
  data: {
    p_id: number;
    user_name: string;
    position: string;
    jobs: string;
    current_state: "new_task" | "in_review" | "approved";
    create_at: Date;
  }[];
}
