// library
import {
  View,
  Text,
  Pressable,
  StatusBar,
  TextInput,
  Image,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useState } from "react";

// components
import { SamePointLogo } from "@/components/load-state/SamePointLoader";

const signin = () => {
  const colorScheme = useColorScheme();

  const insets = useSafeAreaInsets();

  const [inputEmail, setInputEmail] = useState("");

  return (
    <View
      className="bg-background flex-1"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <KeyboardAwareScrollView
        contentContainerClassName="flex-1"
        bottomOffset={30}
      >
        <StatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        />

        <View className="flex-1 items-center justify-center p-4">
          <View className="items-center gap-3">
            <SamePointLogo
              size={85}
              color={colorScheme === "dark" ? "#fff" : "#000"}
            />
            <Text className="text-foreground text-3xl font-medium">
              SamePoint
            </Text>
          </View>
        </View>

        <View className="gap-3 p-4">
          <View className="gap-3">
            <TextInput
              className="border-border text-foreground rounded-[8px] border p-3"
              placeholder="Enter your email"
              placeholderTextColor="#989898"
              onChangeText={setInputEmail}
              value={inputEmail}
            />
            <Pressable className="bg-background-inverse items-center rounded-[10px] p-3 active:opacity-75">
              <Text className="text-foreground-inverse text-lg">Continue</Text>
            </Pressable>
          </View>
          <View className="flex-row items-center gap-4">
            <View className="bg-border h-[1px] flex-1" />
            <Text className="text-border">Or</Text>
            <View className="bg-border h-[1px] flex-1" />
          </View>
          <Pressable className="bg-background-inverse flex-row items-center justify-center rounded-[10px] p-3 active:opacity-75">
            <View className="flex flex-row items-center gap-2">
              <Image
                source={require("@/assets/images/google.png")}
                style={{ width: 17, height: 17 }}
              />
              <Text className="text-foreground-inverse text-lg">
                Continue with Google
              </Text>
            </View>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default signin;
