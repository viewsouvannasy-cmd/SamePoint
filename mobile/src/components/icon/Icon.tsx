import { SearchIcon } from "./icon-list/SearchIcon";
import { ThreeDotIcon } from "./icon-list/ThreeDotIcon";

// types
import type { IconType } from "@/types/icon";
import type { ComponentType } from "react";

const icons = {
  search: SearchIcon,
  "three-dot": ThreeDotIcon,
} satisfies Record<string, ComponentType<IconType>>;

type IconName = keyof typeof icons;

interface Props extends IconType {
  name: IconName;
}

export default function Icon({ name, ...props }: Props) {
  const Component = icons[name];
  return <Component {...props} />;
}
