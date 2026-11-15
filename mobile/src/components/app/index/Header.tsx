import { View, Text, Platform, useColorScheme } from "react-native";

// api
import { useGetUserData } from "@/api/user/user";

// components
import Avatar from "@/components/avatar/Avatar";

export function Header() {
  const colorScheme = useColorScheme();
  const { data } = useGetUserData();

  return (
    <View
      className={`flex-row items-center justify-between px-5 ${Platform.OS === "android" && "pt-2.5"}`}
    >
      <Text className="text-foreground text-3xl font-semibold">Project</Text>
      {!data ? (
        <View className="h-10.75 w-10.75 rounded-full bg-gray-400"></View>
      ) : (
        <Avatar
          seed={data.data[0]?.avatar_seed}
          size={38}
          dark={colorScheme === "dark"}
        />
      )}
    </View>
  );
}
