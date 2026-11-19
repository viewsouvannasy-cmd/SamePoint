import Svg, { Circle, Line } from "react-native-svg";

import type { IconType } from "@/types/icon";

export default function SearchIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 3,
  ...props
}: IconType) {
  return (
    <Svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <Circle cx="20.5" cy="20.5" r="12.5" />
      <Line x1="30.636" y1="30.636" x2="40" y2="40" />
    </Svg>
  );
}
