// library
import { Text, View } from "react-native";
import { Redirect } from "expo-router";

export default function App() {
  const isLogin = false;

  if (!isLogin) {
    return <Redirect href="/(tab)" />;
  }

  return (
    <View className="bg-background flex-1 items-center justify-center">
      <Text className="text-2xl font-bold text-blue-500">
        Welcome to Nativewin
      </Text>
    </View>
  );
}
