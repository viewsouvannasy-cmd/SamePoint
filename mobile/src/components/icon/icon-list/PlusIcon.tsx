import Svg, { Path } from "react-native-svg";

import { IconType } from "@/types/icon";

export function PlusIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.8,
}: IconType) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5v14M5 12h14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
