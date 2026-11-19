// library
import axios from "axios";

// utils
import { getAccessToken } from "@/store/token/accessToken";
import { handleAccessTokenError } from "@/utils/handleError";

// config
import { SERVER_HOST } from "@/config/env";

// type
import type { ProjectDataList } from "@/types/data";

const getProjectListData = async (
  isRetry = false,
): Promise<ProjectDataList> => {
  try {
    const accessToken = getAccessToken();
    const res = await axios.get<ProjectDataList>(
      `${SERVER_HOST}/api/v1/project`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    return res.data;
  } catch (error) {
    return await handleAccessTokenError(error, isRetry, () =>
      getProjectListData(true),
    );
  }
};

export { getProjectListData };
