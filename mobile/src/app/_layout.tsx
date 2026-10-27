// library
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";

import "../global.css";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/(auth)/set-profile");
  }, []);

  return (
    <KeyboardProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="index"
          options={{
            title: "home",
            headerTransparent: false,
          }}
        />
      </Stack>
    </KeyboardProvider>
  );
}
