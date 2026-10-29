import { Text, View } from "react-native";
import { Link, Redirect } from "expo-router";

export default function App() {
  const isUserLogin = false;

  if (!isUserLogin) {
    return <Redirect href="/(auth)/signup" />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind
      </Text>
      <View className="p-3 bg-black">
        <Link href="/(auth)/signup">
          <Text className="text-white">signup</Text>
        </Link>
      </View>
    </View>
  );
}
