// library
import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { Alert } from "react-native";
import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

// type
import type { GoogleResigter } from "@/types/response";

// store
import { saveAccessToken } from "@/store/token/accessToken";

// env
import {
  GOOGLE_CLIENT_IOS_ID,
  GOOGLE_CLIENT_WEB_ID,
  SERVER_HOST,
} from "@/config/env";

GoogleSignin.configure({
  webClientId: GOOGLE_CLIENT_WEB_ID,
  iosClientId: GOOGLE_CLIENT_IOS_ID,
});

const googleResigter = async (): Promise<void> => {
  try {
    await GoogleSignin.hasPlayServices();
    const resGoogle = await GoogleSignin.signIn();
    if (!isSuccessResponse(resGoogle)) {
      return;
    }

    const idToken = resGoogle.data.idToken;

    if (!idToken) {
      throw new Error("No idToken received");
    }

    const response = await axios.get<GoogleResigter>(
      `${SERVER_HOST}/api/v1/oauth/google/mobile`,
      {
        headers: { Authorization: `Bearer ${idToken}` },
      },
    );

    const res = response.data;

    if (!res.ok) {
      throw new Error("Register failed: server returned ok = false");
    }

    saveAccessToken(res.data[0].accessToken);
    await SecureStore.setItemAsync("refreshToken", res.data[0].refreshToken);
    router.replace("/(tab)");
  } catch (error) {
    console.log(error);
    Alert.alert("Something went wrong try again");
  }
};

export default googleResigter;
