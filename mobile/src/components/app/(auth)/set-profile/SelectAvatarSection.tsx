// library
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { useState } from "react";

// components
import { Avatar } from "@/components/avatar/Avatar";

// constants
import { AVATAR_NAME } from "@/constants/avatar-name";
import { BACKGROUND_COLOR } from "@/constants/color";

export function SelectAvatarSection() {
  const [onSection, setOnSection] = useState<"avatar" | "background">("avatar");

  const numColumns = 5;
  const data = onSection === "avatar" ? AVATAR_NAME : BACKGROUND_COLOR;
  const remainder = data.length % numColumns;
  const paddedData =
    remainder === 0
      ? data
      : [...data, ...new Array(numColumns - remainder).fill(null)];
  const dataLength = paddedData.length;

  const rows: (typeof paddedData)[] = [];
  for (let i = 0; i < paddedData.length; i += numColumns) {
    rows.push(paddedData.slice(i, i + numColumns));
  }

  return (
    <View className="bg-card border-border border rounded-[20px] overflow-hidden">
      <View className="flex-row  border-b border-border">
        <Pressable
          onPress={() => setOnSection("avatar")}
          className={`flex-1 p-3 ${onSection === "avatar" ? "bg-accent-secondary" : ""}`}
        >
          <Text className="text-lg text-foreground  text-center ">Avatar</Text>
        </Pressable>
        <Pressable
          onPress={() => setOnSection("background")}
          className={`flex-1 p-3 ${onSection === "background" ? "bg-accent-secondary" : ""}`}
        >
          <Text className="text-lg text-foreground  text-center">
            background
          </Text>
        </Pressable>
      </View>
      {onSection === "avatar" ? (
        <ScrollView
          className="h-[220px]"
          nestedScrollEnabled
          contentContainerClassName="p-3 gap-3"
        >
          {rows.map((row, indexRow) => {
            return (
              <View key={indexRow} className="flex-row gap-3">
                {row.map((item, index) =>
                  item === null ? (
                    <View key={index} className="aspect-square flex-1" />
                  ) : (
                    <View
                      key={index}
                      className="bg-[#d1d5db] rounded-full overflow-hidden flex-1 aspect-square items-center justify-center"
                    >
                      <Avatar avatar={item} size={50} />
                    </View>
                  ),
                )}
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <ScrollView
          className="h-[220px]"
          nestedScrollEnabled
          contentContainerClassName="p-3 gap-3"
        >
          {rows.map((row, indexRow) => {
            return (
              <View key={indexRow} className="flex-row gap-3">
                {row.map((item, index) => {
                  return item === null ? (
                    <View key={index} className="aspect-square flex-1" />
                  ) : (
                    <View
                      key={index}
                      className="rounded-full  overflow-hidden flex-1 aspect-square items-center justify-center"
                      style={{ backgroundColor: item }}
                    />
                  );
                })}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
