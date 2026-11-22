// library
import axios, { isAxiosError } from "axios";

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

const createProject = async (
  isRetry = false,
  { project_name, describe }: { project_name: string; describe: string },
): Promise<void> => {
  try {
    const accessToken = getAccessToken();
    await axios.post(
      `${SERVER_HOST}/api/v1/project`,
      { project_name, describe },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
  } catch (error) {
    console.log(error);
    if (isAxiosError(error) && error.response) {
      if (error.status === 400) {
        throw error;
      }
    }

    return await handleAccessTokenError(error, isRetry, () =>
      createProject(true, { project_name, describe }),
    );
  }
};

export { getProjectListData, createProject };
