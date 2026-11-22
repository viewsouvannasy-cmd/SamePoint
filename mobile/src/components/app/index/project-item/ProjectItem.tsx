// library
import { View, Text, useColorScheme } from "react-native";

// components
import Icon from "@/components/icon/Icon";
import Avatar from "@/components/avatar/Avatar";

// main components
import { StatusTasks } from "./StatusTasks";

// type
import type { ProjectItemData } from "@/types/data";

interface ProjectItemProps {
  item: ProjectItemData;
}

export function ProjectItem({ item }: ProjectItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const isAllEmpty =
    item.new_task.data.length +
      item.in_review.data.length +
      item.approved.data.length ===
    0;

  const total_tasks =
    item.new_task.count + item.in_review.count + item.approved.count;

  const total_completed_tasks = item.approved.count;
  const completePretenage =
    total_tasks === 0
      ? 0
      : Math.round((total_completed_tasks / total_tasks) * 100);

  return (
    <View className="border-border bg-card-project gap-1 rounded-xl border p-3 transition-all active:opacity-60">
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
        {isAllEmpty && !item.describe ? (
          <Text className="text-foreground-secondary">No describe</Text>
        ) : (
          <Text className="text-foreground-secondary">{item.describe}</Text>
        )}

        {item.new_task.data.length > 0 && (
          <StatusTasks state="new_task" item={item.new_task} />
        )}
        {item.in_review.data.length > 0 && (
          <StatusTasks state="in_review" item={item.in_review} />
        )}
        {item.approved.data.length > 0 && (
          <StatusTasks state="approved" item={item.approved} />
        )}
      </View>

      {/* footer card section */}
      <View className="mt-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="flex-row">
            {item?.member_seeds?.slice(0, 4).map((seed, index) => {
              return (
                <View
                  key={index}
                  className="bg-card-project rounded-full p-0.75"
                  style={{ marginLeft: index === 0 ? 0 : -12 }}
                >
                  <Avatar seed={seed} dark={isDark} size={27} ring={false} />
                </View>
              );
            })}
          </View>
          <Text className="text-foreground-secondary">
            {item.member_seeds.length > 4 && `+${item.member_seeds.length - 4}`}
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
            {total_completed_tasks}/{total_tasks}
          </Text>
        </View>
      </View>
    </View>
  );
}
