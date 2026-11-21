import { View, Text, useColorScheme } from "react-native";

// components
import Icon from "@/components/icon/Icon";

// utils
import { getIconStatus, getColorStatus } from "@/utils/status-task";
import { getTimeAgo } from "@/utils/calculate";

import type { TaskData } from "@/types/data";

interface StatusTasksProps {
  state: "new_task" | "in_review" | "approved";
  item: TaskData;
}

export function StatusTasks({ state, item }: StatusTasksProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const colorStatus = getColorStatus(state);

  return (
    <View className="mt-1.5 gap-1.5">
      <View className="flex flex-row items-end gap-2">
        <Text className="text-foreground-secondary text-[14px] font-medium">
          {state === "new_task" && "New Tasks"}
          {state === "in_review" && "In Reiviews"}
          {state === "approved" && "Approved"}
        </Text>
        {item.count > 2 && state !== "approved" && (
          <Text className="text-foreground-secondary text-sm">
            {`+${item.count - 2}`}
          </Text>
        )}
      </View>

      {item.data.map((item, index) => {
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
                <Text className="text-foreground text-sm">{item.jobs}</Text>
                <Text className="text-foreground-secondary text-xs">
                  {item.user_name} · {item.position}
                </Text>
              </View>
            </View>
            <Text className="text-foreground-secondary text-xs">
              {getTimeAgo(item.create_at)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
