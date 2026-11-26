// library
import axios, { isAxiosError } from "axios";
import { router } from "expo-router";
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

const logOut = async () => {
  try {
    const token = await SecureStore.getItemAsync("refreshToken");
    await axios.get(`${SERVER_HOST}/api/v1/auth/mobile/logout`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    router.dismissAll();
    router.replace("/(auth)/signin");
  } catch (error) {
    router.dismissAll();
    router.replace("/(auth)/signin");
    throw error;
  }
};

export { isUserLogin, logOut };
