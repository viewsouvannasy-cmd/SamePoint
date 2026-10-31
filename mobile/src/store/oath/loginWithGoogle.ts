import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { Alert } from "react-native";

import { getEnv } from "@/utils/getEnv";

GoogleSignin.configure({
  webClientId: getEnv("EXPO_PUBLIC_GOOGLE_CLIENT_WEB_ID"),
  iosClientId: getEnv("EXPO_PUBLIC_GOOGLE_CLIENT_IOS_ID"),
});

export const useLoginWithGoogle = () => {
  return useMutation({
    mutationFn: loginWithGoogle,
  });
};

const loginWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const res = await GoogleSignin.signIn();
    if (!isSuccessResponse(res)) {
      return;
    }

    const idToken = res.data.idToken;

    if (!idToken) {
      throw new Error("No idToken received");
    }
  } catch (error) {
    console.log(error);
    Alert.alert("Something went wrong try again");
  }
};
