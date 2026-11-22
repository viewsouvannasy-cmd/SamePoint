// library
import { View, Text, TextInput, Pressable, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { isAxiosError } from "axios";
import { useRouter } from "expo-router";

// components
import LoadingDots from "@/components/load-state/LoadingDots";

// api
import { useCreateProject } from "@/api/project/project";

const CreateProject = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const router = useRouter();

  const [inputProjectName, setInputProjectName] = useState("");
  const [inputDescribe, setInputDescribe] = useState("");

  const { mutate, isPending } = useCreateProject();

  const [errorResponse, setErrorResponse] = useState<{
    point: string;
    content: string;
  } | null>(null);

  const handleCreateProject = () => {
    if (inputProjectName.length === 0) {
      setErrorResponse({
        point: "project_name",
        content: "Name must be at least 5 characters",
      });
      return;
    }

    mutate(
      {
        project_name: inputProjectName,
        describe: inputDescribe,
      },
      {
        onSuccess: () => {
          router.back();
          setInputDescribe("");
          setInputProjectName("");
        },
        onError: (error) => {
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
      <View className="gap-6">
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-foreground text-lg font-semibold">
              Project name
            </Text>
            <Text className="text-foreground-secondary text-sm">
              {inputProjectName.length}/40
            </Text>
          </View>
          <TextInput
            maxLength={40}
            placeholder="Enter yout project name"
            style={{
              paddingTop: 14,
              paddingBottom: 14,
              paddingLeft: 14,
              paddingRight: 14,
              color: isDark ? "#ffffff" : "#000000",
            }}
            placeholderTextColor="rgb(120,120,120)"
            onFocus={() => setErrorResponse(null)}
            onChangeText={setInputProjectName}
            value={inputProjectName}
            className={`bg-background-muted rounded-xl border ${errorResponse ? "border-error" : "border-transparent"} focus:border-blue-500`}
          />
          {errorResponse && (
            <Text className="text-error">{errorResponse.content}</Text>
          )}
        </View>

        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-foreground text-lg font-semibold">
              Describe
            </Text>
            <Text className="text-foreground-secondary text-sm">
              {inputDescribe.length}/255
            </Text>
          </View>

          <TextInput
            placeholder="What this is project about?"
            maxLength={255}
            multiline
            style={{
              paddingTop: 14,
              paddingBottom: 14,
              paddingLeft: 14,
              paddingRight: 14,
              color: isDark ? "#ffffff" : "#000000",
            }}
            textAlignVertical="top"
            placeholderTextColor="rgb(120,120,120)"
            onChangeText={setInputDescribe}
            value={inputDescribe}
            className="bg-background-muted min-h-[150px] rounded-xl border border-transparent focus:border-blue-500"
          />
          <Text className="text-foreground-secondary">
            Optional. You can edit this later.
          </Text>
        </View>
      </View>

      <Pressable
        onPress={handleCreateProject}
        disabled={isPending}
        className={`bg-background-inverse mb-4 h-14 flex-row items-center justify-center-safe gap-2 rounded-full ${isPending ? "" : "active:opacity-75"}`}
      >
        {!isPending ? (
          <Text className="text-foreground-inverse text-lg">Create</Text>
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
    </View>
  );
};

export default CreateProject;
