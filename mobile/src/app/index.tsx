// library
import { Text, View } from "react-native";
import { Redirect } from "expo-router";

import { useEffect } from "react";

export default function App() {
  return <Redirect href="/(auth)/signin" />;

  return (
    <View className="bg-background flex-1 items-center justify-center">
      <Text className="text-2xl font-bold text-blue-500">
        Welcome to Nativewin
      </Text>
    </View>
  );
}
