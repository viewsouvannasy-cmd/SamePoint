// library
import { View, StatusBar, useColorScheme, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  clamp,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

// components
import Icon from "@/components/icon/Icon";

// main components
import { Header } from "@/components/app/index/Header";
import { ProjectItem } from "@/components/app/index/project-item/ProjectItem";

// api
import { useGetProjectListDate } from "@/api/project/project";

const SEARCH_HRIGHT = 60;

function Project() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { data } = useGetProjectListDate();

  const translateY = useSharedValue(0);
  const lastY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      const y = Math.max(0, e.contentOffset.y);
      const diff = y - lastY.value;
      translateY.value = clamp(translateY.value - diff, -SEARCH_HRIGHT, 0);
      lastY.value = y;
    },
  });

  const searchStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: 1 + translateY.value / SEARCH_HRIGHT,
  }));

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingRight: insets.right,
        paddingLeft: insets.left,
      }}
      className="bg-background flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header />

      <View className="mt-3 flex-1 overflow-hidden px-4">
        <Animated.View
          className="bg-background px-4 pt-0.75"
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              height: SEARCH_HRIGHT,
            },
            searchStyle,
          ]}
        >
          <View className="justify-center">
            <View className="absolute z-100 h-10 w-10 items-center justify-center pl-2">
              <Icon
                name="search"
                size={20}
                strokeWidth={4}
                color="rgb(120,120,120)"
              />
            </View>
            <TextInput
              style={{
                color: isDark ? "#ffffff" : "#000000",
              }}
              className="bg-background-muted rounded-full border border-transparent p-3.5 pl-11 focus:border-blue-500"
              placeholderTextColor="rgb(120,120,120)"
              placeholder="Search..."
            />
          </View>
        </Animated.View>

        <Animated.FlatList
          data={data?.data}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-5 grow pt-[61px]"
          ListFooterComponent={<View className="mb-40"></View>}
          keyExtractor={(_, index) => String(index)}
          renderItem={({ item }) => <ProjectItem item={item} />}
          scrollEventThrottle={16}
          onScroll={onScroll}
        />
      </View>
    </View>
  );
}

export default Project;
