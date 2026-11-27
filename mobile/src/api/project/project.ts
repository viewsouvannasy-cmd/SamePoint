// library
import { useMutation, useQuery } from "@tanstack/react-query";

// func
import {
  createProject,
  getProjectListData,
  searchProject,
} from "./project-func";

// config
import queryClient from "@/config/query-client";

// constants
import { PROJECT_LIST } from "@/constants/key-query";

// type
import type { AxiosError } from "axios";
import type { PostResError } from "@/types/response";

const useGetProjectListDate = () => {
  return useQuery({
    queryFn: () => getProjectListData(false),
    queryKey: PROJECT_LIST,
  });
};

const useSearchProject = (search: string) => {
  return useQuery({
    queryFn: () => searchProject(false, { search }),
    queryKey: [...PROJECT_LIST, search],
  });
};

const useCreateProject = () => {
  return useMutation<
    void,
    AxiosError<PostResError>,
    { project_name: string; describe: string }
  >({
    mutationFn: (variable) => createProject(false, variable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_LIST });
    },
  });
};

export { useGetProjectListDate, useCreateProject, useSearchProject };
