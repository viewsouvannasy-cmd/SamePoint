// library
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

// config
import queryClient from "@/config/query-client";

// func
import { changeUserName, getUserData, getUserProfile } from "./user-func";

// key
import { USER } from "@/constants/key-query";

// type
import type { PostResError } from "@/types/response";

export const useGetUserData = () => {
  return useQuery({
    queryFn: () => getUserData(false),
    queryKey: USER,
  });
};

export const useGetUserProfile = () => {
  return useQuery({
    queryFn: () => getUserProfile(false),
    queryKey: [...USER, "profile"],
  });
};

export const useChangeUserName = () => {
  return useMutation<void, AxiosError<PostResError>, { new_name: string }>({
    mutationFn: (variable) => changeUserName(false, variable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...USER] });
    },
  });
};
