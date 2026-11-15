// library
import { View, Text, useColorScheme } from "react-native";

// components
import Icon from "@/components/icon/Icon";
import Avatar from "@/components/avatar/Avatar";

export function ProjectItem() {
  const colorScheme = useColorScheme();
  return (
    <View className="border-border bg-card-project gap-1 rounded-xl border p-3 transition-all">
      {/* header card section */}
      <View className="flex-row justify-between">
        <Text
          className="text-foreground flex-1 text-lg font-semibold"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          LAOS CAPSTONE
        </Text>
        <View className="rotate-90">
          <Icon
            name="three-dot"
            size={20}
            strokeWidth={4}
            color={colorScheme === "dark" ? "white" : "black"}
          />
        </View>
      </View>
      {/* body card section */}
      <View>
        <Text className="text-foreground-secondary">
          Laos capstone is library project where user can find student project
          at the once Place
        </Text>
      </View>

      {/* footer card section */}
      <View className="mt-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="flex-row">
            <View className="bg-card-project rounded-ful p-0.75">
              <Avatar
                seed="d"
                dark={colorScheme === "dark"}
                size={27}
                ring={false}
              />
            </View>
            <View className="bg-card-project -ml-3 rounded-full p-0.75">
              <Avatar
                seed="sddf"
                dark={colorScheme === "dark"}
                size={27}

                ring={false}
              />
            </View>
            <View className="bg-card-project -ml-3 rounded-full p-0.75">
              <Avatar
                seed="wewe"
                size={27}
                dark={colorScheme === "dark"}
                ring={false}
              />
            </View>
          </View>
          <Text className="text-foreground-secondary">+8</Text>
        </View>

        <View className="flex-row items-center gap-3">
          <View className="bg-border-strong-muted relative h-3 w-22 overflow-hidden rounded-full">
            <View className="bg-border-strong h-3 w-10 rounded-full" />
          </View>
          <Text className="text-foreground-secondary font-medium">10/28</Text>
        </View>
      </View>
    </View>
  );
}
