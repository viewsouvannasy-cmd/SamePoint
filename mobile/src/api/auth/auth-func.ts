// library
import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

// env
import { SERVER_HOST } from "@/config/env";

const logOut = async () => {
  try {
    const token = await SecureStore.getItemAsync("refreshToken");
    await axios.get(`${SERVER_HOST}/api/v1/auth/mobile/logout`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    router.dismissAll();
    router.replace("/(auth)/signin");
  } catch (error) {
    router.dismissAll();
    router.replace("/(auth)/signin");
    throw error;
  }
};

export { logOut };
