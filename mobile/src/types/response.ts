interface BaseReponse {
  ok: boolean;
  msg: string;
}

export interface GoogleResigter extends BaseReponse {
  data: [{ accessToken: string; refreshToken: string }];
}

export interface IsUserLogin extends BaseReponse {
  data: [{ accessToken: string }];
}
