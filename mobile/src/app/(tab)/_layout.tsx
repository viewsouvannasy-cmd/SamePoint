import { NativeTabs } from "expo-router/native-tabs";

export default function _layout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{
            default: "folder",
            selected: "folder.fill",
          }}
          md="folder"
        />
        <NativeTabs.Trigger.Label>Project</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="inbox">
        <NativeTabs.Trigger.Icon
          sf={{
            default: "tray",
            selected: "tray.fill",
          }}
          md="inbox"
        />
        <NativeTabs.Trigger.Label>Project</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
