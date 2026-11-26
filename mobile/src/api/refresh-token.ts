import axios from "axios";
import { saveAccessToken, clearAccessToken } from "@/store/token/accessToken";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

import { SERVER_HOST } from "@/config/env";

import type { IsUserLogin as RefreshToken } from "@/types/response";

let refreshPromise: null | Promise<void> = null;

const fetchRefreshToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const clientRefreshToken = await SecureStore.getItemAsync("refreshToken");

      const response = await axios.get<RefreshToken>(
        `${SERVER_HOST}/api/v1/refresh-token/mobile`,
        {
          headers: { Authorization: `Bearer ${clientRefreshToken}` },
        },
      );

      saveAccessToken(response.data.data[0].accessToken);
    } catch (error) {
      clearAccessToken();
      router.replace("/(auth)/signin");
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export { fetchRefreshToken };
