export interface User {
  user_name: string;
  user_email: string;
  avatar_seed: string;
  is_active: boolean;
  create_at: Date;
}

export interface ProjectData {
  p_id: number;
  project_name: string;
  describe: string;
  is_owner: boolean;
  avatar_seed: string;
}

export interface TaskDate {
  t_id: number;
  p_id: number;
  m_id: number;
  user_name: string;
  position: string;
  jobs: string;
  current_state: "new_task" | "in_review" | "approved";
  create_at: Date;
}
