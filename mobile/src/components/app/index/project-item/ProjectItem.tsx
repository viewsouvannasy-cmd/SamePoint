// library
import { View, Text, useColorScheme } from "react-native";

// components
import Icon from "@/components/icon/Icon";
import Avatar from "@/components/avatar/Avatar";

// main components
import { StatusTasks } from "./StatusTasks";

import type { TestData } from "@/app/(tab)";

interface ProjectItemProps {
  item: TestData;
}

export function ProjectItem({ item }: ProjectItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const isAllEmpty =
    item["new-task"].length +
      item["in-review"].length +
      item.approved.length ===
    0;

  const completePretenage =
    item.total_tasks === 0
      ? 0
      : Math.round((item.completed_task / item.total_tasks) * 100);

  return (
    <View className="group border-border bg-card-project active:bg-border gap-1 rounded-xl border p-3 transition-all">
      {/* header card section */}
      <View className="flex-row justify-between">
        <Text
          className="text-foreground flex-1 text-lg font-semibold"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.project_name}
        </Text>
        <View className="active:bg-border rotate-90 items-center justify-center rounded-full">
          <Icon
            name="three-dot"
            size={20}
            strokeWidth={4}
            color={colorScheme === "dark" ? "white" : "black"}
          />
        </View>
      </View>

      {/* body card section */}
      <View>
        {isAllEmpty && (
          <Text className="text-foreground-secondary">{item.describe}</Text>
        )}
        {item["new-task"].length && (
          <StatusTasks state="new-task" data={item["new-task"]} />
        )}
        {item["in-review"].length && (
          <StatusTasks state="in-review" data={item["in-review"]} />
        )}
        {item["approved"].length && (
          <StatusTasks state="approved" data={item["approved"]} />
        )}
      </View>

      {/* footer card section */}
      <View className="mt-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="flex-row">
            {item.member_seeds.slice(0, 4).map((seed, index) => {
              return (
                <View
                  key={index}
                  className="bg-card-project group-active:bg-border rounded-full p-0.75"
                  style={{ marginLeft: index === 0 ? 0 : -12 }}
                >
                  <Avatar seed={seed} dark={isDark} size={27} ring={false} />
                </View>
              );
            })}
          </View>
          <Text className="text-foreground-secondary">
            {item.number_of_member > 4 && `+${item.number_of_member - 4}`}
          </Text>
        </View>

        <View className="flex-1 flex-row items-center justify-end gap-3">
          <View className="bg-border-strong-muted relative h-3 w-[35%] overflow-hidden rounded-full">
            <View
              className="bg-border-strong h-3 rounded-full"
              style={{ width: `${completePretenage}%` }}
            />
          </View>
          <Text className="text-foreground-secondary font-medium">
            {item.completed_task}/{item.total_tasks}
          </Text>
        </View>
      </View>
    </View>
  );
}
