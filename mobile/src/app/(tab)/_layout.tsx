import { NativeTabs } from "expo-router/native-tabs";
import { useColorScheme } from "react-native";

export default function Layout() {
  const colorScheme = useColorScheme();

  const isDark = colorScheme === "dark";
  const color = isDark ? "#ffffff" : "#000000";

  return (
    <NativeTabs tintColor={color}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{ default: "folder", selected: "folder.fill" }}
          src={{
            default: require("@/assets/icon/folder.png"),
            selected: require("@/assets/icon/folder-open.png"),
          }}
        />
        <NativeTabs.Trigger.Label>project</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="inbox">
        <NativeTabs.Trigger.Icon
          sf={{
            default: "tray",
            selected: "tray.fill",
          }}
          src={{
            default: require("@/assets/icon/inbox.png"),
            selected: require("@/assets/icon/inbox-text.png"),
          }}
        />
        <NativeTabs.Trigger.Label>Inbox</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="insights">
        <NativeTabs.Trigger.Icon
          sf={{ default: "chart.bar", selected: "chart.bar.fill" }}
          src={require("@/assets/icon/analytics.png")}
        />
        <NativeTabs.Trigger.Label>Insights</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
