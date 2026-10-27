// library
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Pressable } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

// components
import { ProfileSection } from "@/components/app/(auth)/set-profile/ProfileSection";
import { SelectAvatarSection } from "@/components/app/(auth)/set-profile/SelectAvatarSection";

const SetProfile = () => {
  return (
    <SafeAreaView className="bg-background flex-1">
      <KeyboardAwareScrollView
        bottomOffset={30}
        contentContainerClassName="justify-end flex-1 p-4 gap-5"
      >
        <ProfileSection />
        <SelectAvatarSection />
        <Pressable className="p-3 active:bg-background-inverse/70 bg-background-inverse rounded-[10px] items-center">
          <Text className="text-foreground-inverse text-lg">Done</Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default SetProfile;
