// library
import { useQuery } from "@tanstack/react-query";

// func
import { getProjectListData } from "./project-func";

// constants
import { PROJECT_LIST } from "@/constants/key-query";

const useGetProjectListDate = () => {
  return useQuery({
    queryFn: () => getProjectListData(true),
    queryKey: PROJECT_LIST,
  });
};

export { useGetProjectListDate };
