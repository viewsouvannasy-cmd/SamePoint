// library
import { View, TextInput, useColorScheme } from "react-native";
import { useState } from "react";

import Foundation from "@expo/vector-icons/Foundation";

// components
import { Avatar } from "@/components/avatar/Avatar";

export function ProfileSection() {
  const [inputName, setInputName] = useState("");
  const colorScheme = useColorScheme();
  return (
    <View className="items-center gap-2">
      <View className=" bg-gray-300 rounded-full overflow-hidden">
        <Avatar avatar="pixel-dog" size={100} />
      </View>
      <View className="flex-row items-center gap-3 ">
        <TextInput
          placeholder="My Name"
          placeholderTextColor="rgb(120, 120, 120)"
          placeholderClassName="font-bold"
          className="text-3xl text-foreground "
          value={inputName}
          onChangeText={setInputName}
        />
        {inputName.length === 0 && (
          <Foundation
            name="pencil"
            size={20}
            color={colorScheme === "dark" ? "white" : "black"}
          />
        )}
      </View>
    </View>
  );
}
