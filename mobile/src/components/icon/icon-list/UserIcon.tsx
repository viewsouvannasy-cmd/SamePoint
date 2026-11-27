import Svg, { Circle, Path } from "react-native-svg";
import { IconType } from "@/types/icon";

export default function UserIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.6,
  ...props
}: IconType) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Head */}
      <Circle cx={12} cy={7} r={4.5} stroke={color} strokeWidth={strokeWidth} />
      {/* Shoulders */}
      <Path
        d="M4 21a8 8 0 0 1 16 0"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
