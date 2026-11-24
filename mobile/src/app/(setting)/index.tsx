// library
import { View, Text, useColorScheme, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// components
import Avatar from "@/components/avatar/Avatar";
import Icon from "@/components/icon/Icon";

const Setting = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingBottom: insets.bottom }}
      className="bg-background flex-1 justify-between px-5 pt-5"
    >
      <View className="gap-5">
        {/* =========== profile ======= */}
        <View className="bg-background-secondary-muted flex-row items-center justify-between gap-5 rounded-3xl p-3.5">
          <View className="flex-row gap-5">
            <Avatar seed="32" size={55} dark={isDark} />

            <View>
              <Text className="text-foreground text-2xl font-semibold">
                user name
              </Text>
              <Text className="text-foreground-secondary">
                yserEmail@gmail.com
              </Text>
            </View>
          </View>

          <Pressable className="bg-background border-border rounded-full border p-3">
            <Text className="text-foreground">Edit</Text>
          </Pressable>
        </View>

        {/* =========== Account ======= */}
        <View className="gap-2">
          <Text className="text-foreground-secondary text-sm font-semibold">
            ACCOUNT
          </Text>

          <View className="bg-border gap-px overflow-hidden rounded-3xl">
            <View className="bg-background-secondary-muted flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <View className="flex h-6 w-6 items-center justify-center">
                  <Icon
                    name="user"
                    size={20}
                    color={isDark ? "#b5b5b5" : "#525252"}
                  />
                </View>

                <Text className="text-foreground text-xl">User name</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Text className="text-foreground-secondary text-lg">view</Text>
                <Icon
                  name="chevron"
                  size={15}
                  strokeWidth={2}
                  color={isDark ? "#b5b5b5" : "#525252"}
                />
              </View>
            </View>

            <View className="bg-background-secondary-muted flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <View className="flex h-6 w-6 items-center justify-center">
                  <Icon
                    name="mail"
                    size={19}
                    color={isDark ? "#b5b5b5" : "#525252"}
                  />
                </View>

                <Text className="text-foreground text-xl">Email</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-foreground-secondary text-lg">
                  example@gmail.com
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
                  size={20}
                  color={isDark ? "#b5b5b5" : "#525252"}
                />
              </View>

              <Text className="text-foreground text-xl">Archived projects</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="bg-background h-6 w-6 items-center justify-center rounded-full">
                <Text className="text-foreground font-medium">3</Text>
              </View>
              <Icon
                name="chevron"
                size={15}
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
              <View className="bg-background border-border h-21 flex-1 items-center justify-center gap-1 rounded-2xl border-2">
                <View className="h-8 w-8 rounded-full border border-[#b4b4b4] bg-[#e5e7eb]" />
                <Text className="text-foreground font-semibold">Light</Text>
              </View>

              <View className="bg-background border-border h-21 flex-1 items-center justify-center gap-1 rounded-2xl border-2">
                <View className="h-8 w-8 rounded-full border border-[#3c3c3c] bg-[#111111]" />
                <Text className="text-foreground font-semibold">Dark</Text>
              </View>

              <View className="bg-background border-border h-21 flex-1 items-center justify-center gap-1 rounded-2xl border-2">
                <View className="h-8 w-8 flex-row overflow-hidden rounded-full border border-[#b4b4b4]">
                  <View className="h-full w-[50%] bg-[#e5e7eb]" />
                  <View className="h-full w-[55%] bg-[#111111]" />
                </View>
                <Text className="text-foreground font-semibold">System</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <Pressable className="bg-error-muted mb-4 flex h-14 items-center justify-center-safe rounded-full">
        <Text className="text-error text-lg font-semibold">Log out</Text>
      </Pressable>
    </View>
  );
};

export default Setting;
