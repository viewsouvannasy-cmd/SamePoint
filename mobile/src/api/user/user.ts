// library
import { useQuery } from "@tanstack/react-query";

// func
import { getUserData, getUserProfile } from "./user-func";

// key
import { USER } from "@/constants/key-query";

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
