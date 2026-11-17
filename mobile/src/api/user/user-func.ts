// library
import axios from "axios";

// utils
import { handleAccessTokenError } from "@/utils/handleError";
import { getAccessToken } from "@/store/token/accessToken";

// env
import { SERVER_HOST } from "@/config/env";

// type
import type { User } from "@/types/data";

const getUserData = async (isRetry = false): Promise<User> => {
  try {
    const accessToken = getAccessToken();
    const res = await axios.get<User>(`${SERVER_HOST}/api/v1/user`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return res.data;
  } catch (error) {
    return await handleAccessTokenError(error, isRetry, () =>
      getUserData(true),
    );
  }
};

export { getUserData };
