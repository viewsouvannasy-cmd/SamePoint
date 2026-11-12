// library
import { View, useColorScheme } from "react-native";
import { Redirect } from "expo-router";

// components
import { SamePointLoader } from "@/components/load-state/SamePointLoader";
import { SamePointLogo } from "@/components/logo/SamePointLogo";

export default function App() {
  const colorScheme = useColorScheme();
  const isLogin = false;

  return (
    <View className="bg-background flex-1 items-center justify-center">
      <SamePointLoader
        size={100}
        color={colorScheme === "dark" ? "#fff" : "#000"}
      />
    </View>
  );
}
