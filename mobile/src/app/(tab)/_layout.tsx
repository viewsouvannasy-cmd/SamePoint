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
          sf={{
            default: "folder",
            selected: "folder.fill",
          }}
          md={{
            default: "folder",
            selected: "folder_open",
          }}
        />
        <NativeTabs.Trigger.Label>Project</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="inbox">
        <NativeTabs.Trigger.Icon
          sf={{
            default: "tray",
            selected: "tray.fill",
          }}
          md={{ default: "inbox", selected: "inbox_text" }}
        />
        <NativeTabs.Trigger.Label>Inbox</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="insights">
        <NativeTabs.Trigger.Icon
          sf={{ default: "chart.bar", selected: "chart.bar.fill" }}
          md={{ default: "analytics", selected: "analytics" }}
        />
        <NativeTabs.Trigger.Label>Insights</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
