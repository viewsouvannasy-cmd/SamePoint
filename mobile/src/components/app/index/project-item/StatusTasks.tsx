import { View, Text, useColorScheme } from "react-native";

// components
import Icon from "@/components/icon/Icon";

// utils
import { getIconStatus, getColorStatus } from "@/utils/status-task";
import { getTimeAgo } from "@/utils/calculate";

import type { Status } from "@/app/(tab)";

interface StatusTasksProps {
  state: "new-task" | "in-review" | "approved";
  data: Status[];
}

export function StatusTasks({ state, data }: StatusTasksProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const colorStatus = getColorStatus(state);

  return (
    <View className="mt-1.5 gap-1.5">
      <Text className="text-foreground-secondary text-[14px] font-medium">
        {state === "new-task" && "New Tasks"}
        {state === "in-review" && "In Reiviews"}
        {state === "approved" && "Approved"}
      </Text>
      {data.map((item, index) => {
        return (
          <View
            key={index}
            className={`${colorStatus.border} ${colorStatus.bg} flex-row items-center justify-between rounded-lg border px-2.75 py-2`}
          >
            <View className="flex-row items-center gap-3">
              <Icon
                name={getIconStatus(state)}
                size={18}
                color={isDark ? "white" : "black"}
              />
              <View>
                <Text className="text-foreground text-sm">{item.job}</Text>
                <Text className="text-foreground-secondary text-xs">
                  {item.name} · {item.position}
                </Text>
              </View>
            </View>
            <Text className="text-foreground-secondary text-xs">
              {getTimeAgo(item.time)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
