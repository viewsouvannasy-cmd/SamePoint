export interface BaseReponse {
  ok: boolean;
  msg: string;
}

export interface GoogleResigter extends BaseReponse {
  data: [{ accessToken: string; refreshToken: string }];
}

export interface RefreshToken extends BaseReponse {
  data: [{ accessToken: string }];
}

export interface CreateProjectError extends Omit<BaseReponse, "msg"> {
  msg: {
    point: string;
    content: string;
  };
  data: [];
}
