import type { BaseReponse } from "./response";

export interface User extends BaseReponse {
  data: [
    {
      user_name: string;
      user_email: string;
      avatar_seed: string;
      profile_url: string;
      total_archive_project: number;
    },
  ];
}

export interface UserProfile extends BaseReponse {
  data: [
    {
      avatar_seed: string;
      profile_url: string;
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
