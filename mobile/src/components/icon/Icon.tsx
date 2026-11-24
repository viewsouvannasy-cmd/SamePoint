import SearchIcon from "./icon-list/SearchIcon";
import ThreeDotIcon from "./icon-list/ThreeDotIcon";
import AddIcon from "./icon-list/AddIcon";
import PlusIcon from "./icon-list/PlusIcon";
import ReportIcon from "./icon-list/ReportIcon";
import CheckIcon from "./icon-list/CheckIcon";
import ComposeIcon from "./icon-list/ComposeIcon";
import ArchiveIcon from "./icon-list/ArchiveIcon";
import TrashIcon from "./icon-list/TrashIcon";
import UserIcon from "./icon-list/UserIcon";
import MailIcon from "./icon-list/MailIcon";
import ChevronIcon from "./icon-list/ChevronIcon";

// types
import type { IconType } from "@/types/icon";
import type { ComponentType } from "react";

const icons = {
  search: SearchIcon,
  "three-dot": ThreeDotIcon,
  add: AddIcon,
  plus: PlusIcon,
  report: ReportIcon,
  check: CheckIcon,
  compose: ComposeIcon,
  archive: ArchiveIcon,
  trash: TrashIcon,
  user: UserIcon,
  mail: MailIcon,
  chevron: ChevronIcon,
} satisfies Record<string, ComponentType<IconType>>;

type IconName = keyof typeof icons;

interface Props extends IconType {
  name: IconName;
}

export default function Icon({ name, ...props }: Props) {
  const Component = icons[name];
  return <Component {...props} />;
}
