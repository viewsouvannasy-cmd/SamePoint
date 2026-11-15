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
