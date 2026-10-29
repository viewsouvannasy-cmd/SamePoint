import { StyleSheet, Text, View } from "react-native";
import { NativeTabs } from "expo-router/native-tabs";

export default function _layout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Project</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{
            default: "list.bullet.clipboard",
            selected: "list.bullet.clipboard.fill",
          }}
          md="list"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

const styles = StyleSheet.create({});
