// library
import {
  View,
  Text,
  useColorScheme,
  Pressable,
  Appearance,
} from "react-native";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

// components
import Avatar from "@/components/avatar/Avatar";
import Icon from "@/components/icon/Icon";
import LoadingDots from "@/components/load-state/LoadingDots";

// api
import { useGetUserData } from "@/api/user/user";
import { useLogOut } from "@/api/auth/auth";

const Setting = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [theme, setTheme] = useState("");

  const { data } = useGetUserData();
  const userData = data?.data[0];

  // api function
  const { mutate, isPending } = useLogOut();

  // change theme
  const handleChangeTheme = async (theme: "system" | "light" | "dark") => {
    setTheme(theme);
    Appearance.setColorScheme(theme === "system" ? "auto" : theme);
    await AsyncStorage.setItem("theme", theme);
  };

  // push current from acyns storage to state
  useEffect(() => {
    const fetchTheme = async () => {
      const theme = (await AsyncStorage.getItem("theme")) ?? "system";
      setTheme(theme);
    };
    fetchTheme();
  }, []);

  return (
    <View
      style={{ paddingBottom: insets.bottom }}
      className="bg-background flex-1 justify-between px-5 pt-5"
    >
      <View className="gap-5">
        {/* =========== profile ======= */}
        <View className="bg-background-secondary-muted flex-row items-center justify-between gap-3 rounded-3xl p-3.5">
          <View className="flex-1 flex-row gap-4">
            {!userData ? (
              <View className="size-16 rounded-full bg-gray-300" />
            ) : (
              <Avatar seed={userData?.avatar_seed} size={55} dark={isDark} />
            )}

            <View className="flex-1">
              <Text
                className="text-foreground text-2xl font-semibold"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {userData?.user_name}
              </Text>
              <Text
                className="text-foreground-secondary"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {userData?.user_email}
              </Text>
            </View>
          </View>

          <Pressable className="bg-background border-border shrink-0 rounded-full border p-3">
            <Icon name="camera" color={isDark ? "#fff" : "#000"} />
          </Pressable>
        </View>

        {/* =========== Account ======= */}
        <View className="gap-2">
          <Text className="text-foreground-secondary text-sm font-semibold">
            ACCOUNT
          </Text>

          <View className="bg-border gap-px overflow-hidden rounded-3xl">
            <Pressable
              onPress={() => router.push("/(setting)/change-user-name")}
              className="bg-background-secondary-muted active:bg-border flex-row items-center justify-between p-4"
            >
              <View className="flex-row items-center gap-3">
                <View className="flex h-6 w-6 items-center justify-center">
                  <Icon
                    name="user"
                    size={19}
                    color={isDark ? "#b5b5b5" : "#525252"}
                  />
                </View>

                <Text className="text-foreground text-lg">User name</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Text className="text-foreground-secondary">
                  {userData?.user_name}
                </Text>
                <Icon
                  name="chevron"
                  size={14}
                  strokeWidth={2}
                  color={isDark ? "#b5b5b5" : "#525252"}
                />
              </View>
            </Pressable>

            <View className="bg-background-secondary-muted flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <View className="flex h-6 w-6 items-center justify-center">
                  <Icon
                    name="mail"
                    size={18}
                    color={isDark ? "#b5b5b5" : "#525252"}
                  />
                </View>

                <Text className="text-foreground text-lg">Email</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-foreground-secondary">
                  {userData?.user_email}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* =========== projects ======= */}
        <View className="gap-2">
          <Text className="text-foreground-secondary text-sm font-semibold">
            PROJECTS
          </Text>

          <View className="bg-background-secondary-muted flex-row items-center justify-between rounded-3xl p-4">
            <View className="flex-row items-center gap-3">
              <View className="flex h-6 w-6 items-center justify-center">
                <Icon
                  name="archive"
                  size={19}
                  color={isDark ? "#b5b5b5" : "#525252"}
                />
              </View>

              <Text className="text-foreground text-lg">Archived projects</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="bg-background h-6 w-6 items-center justify-center rounded-full">
                <Text className="text-foreground font-medium">
                  {userData?.total_archive_project}
                </Text>
              </View>
              <Icon
                name="chevron"
                size={14}
                strokeWidth={2}
                color={isDark ? "#b5b5b5" : "#525252"}
              />
            </View>
          </View>
        </View>

        {/* =========== Appearance ======= */}
        <View className="gap-2">
          <Text className="text-foreground-secondary text-sm font-semibold">
            APPEARANCE
          </Text>

          <View className="bg-background-secondary-muted gap-2 rounded-3xl p-4">
            <Text className="text-foreground text-xl">Color theme</Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => handleChangeTheme("light")}
                className={`bg-background h-21 flex-1 items-center justify-center gap-1 rounded-2xl border-2 ${theme === "light" ? "border-blue-500" : "border-border"}`}
              >
                <View className="h-8 w-8 rounded-full border border-[#b4b4b4] bg-[#e5e7eb]" />
                <Text className="text-foreground font-semibold">Light</Text>
              </Pressable>

              <Pressable
                onPress={() => handleChangeTheme("dark")}

                className={`bg-background h-21 flex-1 items-center justify-center gap-1 rounded-2xl border-2 ${theme === "dark" ? "border-blue-500" : "border-border"}`}
              >
                <View className="h-8 w-8 rounded-full border border-[#3c3c3c] bg-[#111111]" />
                <Text className="text-foreground font-semibold">Dark</Text>
              </Pressable>

              <Pressable
                onPress={() => handleChangeTheme("system")}
                className={`bg-background h-21 flex-1 items-center justify-center gap-1 rounded-2xl border-2 ${theme === "system" ? "border-blue-500" : "border-border"}`}
              >
                <View className="h-8 w-8 flex-row overflow-hidden rounded-full border border-[#b4b4b4]">
                  <View className="h-full w-[50%] bg-[#e5e7eb]" />
                  <View className="h-full w-[55%] bg-[#111111]" />
                </View>
                <Text className="text-foreground font-semibold">System</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      <Pressable
        className="bg-error-muted mb-4 flex h-14 items-center justify-center-safe rounded-full"
        onPress={() => mutate()}
        disabled={isPending}
      >
        {!isPending ? (
          <Text className="text-error text-lg font-semibold">Log out</Text>
        ) : (
          <LoadingDots
            count={4}
            size={6}
            spacing={4}
            color={colorScheme === "dark" ? "#a72d27" : "#d93025"}
            variant="fade"
          />
        )}
      </Pressable>
    </View>
  );
};

export default Setting;
