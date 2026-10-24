// library
import { View, Text, Pressable, TextInput, StatusBar } from "react-native";
import { Image } from "expo-image";
import { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

// halper function
import { checkOS } from "@/utils/checkOS";

const signup = () => {
  const [inputEmail, setInputEmail] = useState("");

  return (
    <KeyboardAwareScrollView
      contentContainerClassName="flex-1 justify-between bg-white"
      bottomOffset={30}
    >
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 p-4 items-center justify-center">
        <View className="items-center gap-3">
          <Image
            source={require("@/assets/images/same-point-logo.png")}
            style={{ width: 80, height: 80 }}
            contentFit="contain"
          />
          <Text className="text-3xl font-medium">SamePoint</Text>
        </View>
      </View>
      <View className={`p-4 gap-3  ${checkOS("ios") ? "pb-10" : "pb-6"}`}>
        <View className="gap-3">
          <TextInput
            className="border border-[#989898] p-3 rounded-[8px]"
            placeholder="Enter your email"
            onChangeText={setInputEmail}
            placeholderTextColor="#9CA3AF"
            value={inputEmail}
          />

          <Pressable className="p-3 bg-black rounded-[10px] items-center ">
            <Text className="text-white text-lg">Continue</Text>
          </Pressable>
        </View>
        <View className=" flex-row items-center gap-4">
          <View className="bg-[#9CA3AF] flex-1 h-[1px] " />
          <Text className="text-[#9CA3AF]">Or</Text>
          <View className="bg-[#9CA3AF] flex-1 h-[1px] " />
        </View>
        <Pressable className="p-3 flex-row gap-2 justify-center bg-black rounded-[10px] items-center ">
          <Image
            source={require("@/assets/images/google.png")}
            style={{ width: 17, height: 17 }}
          />
          <Text className="text-white text-lg ">Continue with Google</Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default signup;
