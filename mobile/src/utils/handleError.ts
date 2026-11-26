import { isAxiosError } from "axios";
import { fetchRefreshToken } from "@/api/refresh-token";
import { router } from "expo-router";

export const handleAccessTokenError = async <T>(
  error: unknown,
  isRetry: boolean,
  retry: () => Promise<T>,
): Promise<T> => {
  if (isAxiosError(error) && error.response) {
    console.log(error, error.response.data);
    if (error.response.status === 401 && !error.response.data.ok_verify_token) {
      const msg = error.response.data.msg;

      if (msg === "TOKEN_EXPIRED" || msg === "TOKEN_MISSING") {
        if (!isRetry) {
          await fetchRefreshToken();
          return await retry();
        }
      }

      if (msg === "TOKEN_INVALID") {
        router.replace("/(auth)/signin");
        throw error;
      }
    }
  }

  router.replace("/(auth)/signin");
  throw error;
};
