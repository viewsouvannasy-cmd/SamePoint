// library
import axios, { isAxiosError } from "axios";
import * as SecureStore from "expo-secure-store";

// env
import { SERVER_HOST } from "@/config/env";

import { saveAccessToken } from "@/store/token/accessToken";

// type
import type { IsUserLogin } from "@/types/response";

const isUserLogin = async (): Promise<IsUserLogin> => {
  try {
    const token = await SecureStore.getItemAsync("refreshToken");
    const response = await axios.get<IsUserLogin>(
      `${SERVER_HOST}/api/v1/auth/mobile/is-login`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const res = response.data;
    saveAccessToken(res.data[0].accessToken);
    return res;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      return error.response.data;
    }
    throw error;
  }
};

export { isUserLogin };
