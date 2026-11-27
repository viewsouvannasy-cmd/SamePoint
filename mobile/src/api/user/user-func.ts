// library
import axios, { isAxiosError } from "axios";

// utils
import { handleAccessTokenError } from "@/utils/handleError";
import { getAccessToken } from "@/store/token/accessToken";

// env
import { SERVER_HOST } from "@/config/env";

// type
import type { User, UserProfile } from "@/types/data";

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

const getUserProfile = async (isRetry = false): Promise<UserProfile> => {
  try {
    const accessToken = getAccessToken();
    const res = await axios.get<UserProfile>(
      `${SERVER_HOST}/api/v1/user/profile`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    return res.data;
  } catch (error) {
    return await handleAccessTokenError(error, isRetry, () =>
      getUserProfile(true),
    );
  }
};

const changeUserName = async (
  isRetry = false,
  { new_name }: { new_name: string },
): Promise<void> => {
  try {
    const accessToken = getAccessToken();
    await axios.put<UserProfile>(
      `${SERVER_HOST}/api/v1/user/user-name`,
      {
        new_name,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      if (error.status === 400) {
        throw error;
      }
    }

    return await handleAccessTokenError(error, isRetry, () =>
      changeUserName(true, { new_name }),
    );
  }
};

export { getUserData, getUserProfile, changeUserName };
