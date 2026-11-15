// library
import { useQuery } from "@tanstack/react-query";

// query
import { getUserData } from "./user-func";

// key
import { USER } from "@/constants/key-query";

export const useGetUserData = () => {
  return useQuery({
    queryFn: () => getUserData(),
    queryKey: USER,
  });
};
