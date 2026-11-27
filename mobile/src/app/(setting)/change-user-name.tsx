// library
import { View, Text, TextInput, useColorScheme, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { isAxiosError } from "axios";

// components
import Icon from "@/components/icon/Icon";
import { useState } from "react";
import LoadingDots from "@/components/load-state/LoadingDots";

// api
import { useChangeUserName } from "@/api/user/user";

const ChangeUserName = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [isFocused, setIsFocused] = useState(false);
  const [inputName, setInputName] = useState("");

  //  api func
  const { mutate, isPending } = useChangeUserName();

  //   handle post error
  const [errorResponse, setErrorResponse] = useState<{
    point: string;
    content: string;
  } | null>(null);

  function handleCancel() {
    if (isPending) {
      return;
    }
    setInputName("");
    router.back();
  }

  const handleChangeName = () => {
    if (isPending) {
      return;
    }

    if (inputName.length === 0) {
      setErrorResponse({
        point: "new_name",
        content: "Name must be at least 3 characters",
      });
    }

    mutate(
      {
        new_name: inputName,
      },
      {
        onSuccess: () => {
          setInputName("");
          router.back();
        },
        onError: (error: unknown) => {
          if (isAxiosError(error) && error.response) {
            setErrorResponse(error.response.data.msg);
          }
        },
      },
    );
  };

  return (
    <View
      style={{ paddingBottom: insets.bottom }}
      className="bg-background flex-1 justify-between px-5 pt-5"
    >
      <View className="gap-2">
        <Text className="text-foreground text-lg font-semibold">User name</Text>
        <View className="relative justify-center">
          <TextInput
            placeholder="My new name.."
            className={`bg-background-muted rounded-xl border focus:border-blue-500 ${errorResponse ? "border-error" : "border-transparent"} `}
            placeholderTextColor="rgb(120,120,120)"
            maxLength={30}
            onFocus={() => {
              setErrorResponse(null);
              setIsFocused(true);
            }}
            onBlur={() => setIsFocused(false)}
            style={{
              paddingTop: 14,
              paddingBottom: 14,
              paddingLeft: 14,
              paddingRight: 50,
              color: isDark ? "#ffffff" : "#000000",
            }}
            onChangeText={setInputName}
            value={inputName}
          />
          {isFocused && inputName.length > 0 && (
            <Pressable
              onPress={() => setInputName("")}
              className="bg-border-strong-muted absolute right-3.5 h-7.5 w-7.5 rotate-45 items-center justify-center rounded-full"
            >
              <Icon
                name="plus"
                size={16}
                color={isDark ? "#b5b5b5" : "#525252"}
              />
            </Pressable>
          )}
        </View>

        <View className="flex-row items-center justify-between">
          <Text
            className={`${errorResponse ? "text-error" : "text-foreground-secondary"} text-sm`}
          >
            {errorResponse
              ? errorResponse.content
              : "Shown to teammates and on your projects"}
          </Text>
          <Text
            className={` ${inputName.length === 30 ? "text-error" : "text-foreground-secondary"}`}
          >
            {inputName.length}/30
          </Text>
        </View>
      </View>

      <View className="mb-4 gap-2.5">
        <Pressable
          className={`bg-background-inverse h-14 flex-row items-center justify-center-safe gap-2 rounded-full ${isPending ? "" : "active:opacity-75"}`}
          onPress={handleChangeName}
          disabled={isPending}
        >
          {!isPending ? (
            <Text className="text-foreground-inverse text-lg">Save name</Text>
          ) : (
            <LoadingDots
              count={4}
              size={6}
              spacing={4}
              color={colorScheme === "dark" ? "#000" : "#fff"}
              variant="fade"
            />
          )}
        </Pressable>
        <Pressable
          onPress={handleCancel}
          disabled={isPending}
          className="h-14 items-center justify-center"
        >
          <Text className="text-foreground text-lg">Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ChangeUserName;
