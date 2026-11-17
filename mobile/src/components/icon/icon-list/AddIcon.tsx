import Svg, { Rect, Path } from "react-native-svg";

import { IconType } from "@/types/icon";

export default function AddIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.6,
  ...props
}: IconType) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Rounded square */}
      <Rect
        x={3}
        y={3}
        width={18}
        height={18}
        rx={5}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      {/* Plus */}
      <Path
        d="M12 9v6M9 12h6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
