export interface User {
  user_name: string;
  user_email: string;
  avatar_seed: string;
  profile_url: string;
  total_archive_project: number;
}

export interface ProjectData {
  p_id: number;
  project_name: string;
  describe: string;
}

export interface TaskDate {
  p_id: number;
  user_name: string;
  position: string;
  jobs: string;
  current_state: "new_task" | "in_review" | "approved";
  create_at: Date;
}

export interface TotalEachState {
  p_id: number;
  current_state: "new_task" | "in_review" | "approved";
  count: number;
}
