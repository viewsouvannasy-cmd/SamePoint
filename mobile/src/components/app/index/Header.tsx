import { View, Text, Platform, useColorScheme, Pressable } from "react-native";
import { useRouter } from "expo-router";

// api
import { useGetUserData } from "@/api/user/user";

// components
import Avatar from "@/components/avatar/Avatar";
import Icon from "@/components/icon/Icon";

export function Header() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const router = useRouter();

  const { data } = useGetUserData();

  return (
    <View
      className={`flex-row items-center justify-between px-5 ${Platform.OS === "android" && "pt-2.5"}`}
    >
      <Text className="text-foreground text-3xl font-semibold">Project</Text>
      <View className="flex-row gap-2">
        <Pressable
          onPress={() => router.push("/create-project")}
          className="border-border active:bg-border h-10.75 w-10.75 items-center justify-center rounded-full border"
        >
          <Icon name="plus" color={isDark ? "white" : "black"} />
        </Pressable>
        {!data ? (
          <View className="h-10.75 w-10.75 rounded-full bg-gray-400" />
        ) : (
          <Avatar seed={data.data[0]?.avatar_seed} size={38} dark={isDark} />
        )}
      </View>
    </View>
  );
}
