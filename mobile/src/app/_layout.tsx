import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { QueryClientProvider } from "@tanstack/react-query";
import { useColorScheme } from "react-native";

import queryClient from "@/config/query-client";

import "../global.css";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <QueryClientProvider client={queryClient}>
      <KeyboardProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tab)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen
            name="(project)/create-project"

            options={{
              headerStyle: {
                backgroundColor: isDark ? "#111111" : "#ffffff",
              },
              title: "Create Project",
              headerTitleStyle: {
                fontSize: 18,
                fontWeight: "600",
                color: isDark ? "#ffffff" : "#000000",
              },
              headerTransparent: false,
              headerBackButtonDisplayMode: "minimal",
              headerShadowVisible: false,
            }}
          />

          {/* setting */}
          <Stack.Screen
            name="(setting)"
            options={{
              headerStyle: {
                backgroundColor: isDark ? "#111111" : "#ffffff",
              },
              title: "Setting",
              headerTitleStyle: {
                fontSize: 18,
                fontWeight: "600",
                color: isDark ? "#ffffff" : "#000000",
              },
              headerTransparent: false,
              headerBackButtonDisplayMode: "minimal",
              headerShadowVisible: false,
            }}
          />
        </Stack>
      </KeyboardProvider>
    </QueryClientProvider>
  );
}
