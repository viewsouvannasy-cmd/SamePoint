// library
import {
  View,
  Text,
  Pressable,
  TextInput,
  StatusBar,
  useColorScheme,
} from "react-native";
import { Image } from "expo-image";
import { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

// halper function
import { checkOS } from "@/utils/checkOS";
import { SamePointLogo } from "@/components/logo/SamePointLogo";

const signup = () => {
  const colorScheme = useColorScheme();

  const [inputEmail, setInputEmail] = useState("");

  return (
    <KeyboardAwareScrollView
      contentContainerClassName="flex-1 justify-between bg-background"
      bottomOffset={30}
    >
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      <View className="flex-1 p-4 items-center justify-center">
        <View className="items-center gap-3">
          <SamePointLogo
            size={85}
            color={colorScheme === "dark" ? "#fff" : "#000"}
          />
          <Text className="text-3xl text-foreground font-medium">
            SamePoint
          </Text>
        </View>
      </View>
      <View className={`p-4 gap-3  ${checkOS("ios") ? "pb-10" : "pb-6"}`}>
        <View className="gap-3">
          <TextInput
            className="border border-border text-foreground p-3 rounded-[8px]"
            placeholder="Enter your email"
            onChangeText={setInputEmail}

            value={inputEmail}
          />
          <Pressable className="p-3 bg-background-inverse rounded-[10px] items-center ">
            <Text className="text-foreground-inverse text-lg">Continue</Text>
          </Pressable>
        </View>
        <View className=" flex-row items-center gap-4">
          <View className="bg-border flex-1 h-[1px] " />
          <Text className="text-border">Or</Text>
          <View className="bg-border flex-1 h-[1px] " />
        </View>
        <Pressable className="p-3 flex-row gap-2 justify-center bg-background-inverse rounded-[10px] items-center ">
          <Image
            source={require("@/assets/images/google.png")}
            style={{ width: 17, height: 17 }}
          />
          <Text className="text-foreground-inverse text-lg ">
            Continue with Google
          </Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default signup;
