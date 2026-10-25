// library
import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useColorScheme } from "react-native";

import "../global.css";

export default function RootLayout() {
  const colorScheme = useColorScheme();

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
