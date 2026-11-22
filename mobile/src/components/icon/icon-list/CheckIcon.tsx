import type { IconType } from "@/types/icon";
import Svg, { Circle, Path } from "react-native-svg";

export default function CheckIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
}: IconType) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Outer circle */}
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      {/* Checkmark */}
      <Path
        d="M8 12.5L10.8 15.3L16 9.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
