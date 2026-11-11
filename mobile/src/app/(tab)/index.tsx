import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function Project() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingRight: insets.right,
        paddingLeft: insets.left,
      }}
      className="bg-background flex-1"
    >
      <Text className="text-foreground text-3xl">Projec</Text>
    </View>
  );
}

export default Project;
