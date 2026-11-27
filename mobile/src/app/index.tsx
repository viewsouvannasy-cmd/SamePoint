// library
import { useState, useEffect } from "react";
import { View, useColorScheme } from "react-native";
import { Redirect } from "expo-router";

// components
import { SamePointLoader } from "@/components/load-state/SamePointLoader";
import { fetchRefreshToken } from "@/api/refresh-token";

export default function App() {
  const colorScheme = useColorScheme();
  const [isLogin, setIsLogin] = useState<null | boolean>(null);

  useEffect(() => {
    const fetch = async () => {
      await fetchRefreshToken()
        .then(() => setIsLogin(true))
        .catch(() => setIsLogin(false));
    };
    fetch();
  }, []);

  if (isLogin === true) {
    return <Redirect href="/(tab)" />;
  }

  if (isLogin === false) {
    return <Redirect href="/(auth)/signin" />;
  }

  return (
    <View className="bg-background flex-1 items-center justify-center">
      <SamePointLoader
        size={100}
        color={colorScheme === "dark" ? "#fff" : "#000"}
      />
    </View>
  );
}
