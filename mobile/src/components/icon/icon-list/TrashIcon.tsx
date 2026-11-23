import Svg, { Path } from "react-native-svg";
import { IconType } from "@/types/icon";

export default function TrashIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.6,
  ...props
}: IconType) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Lid line */}
      <Path
        d="M3 5.5h18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Lid handle */}
      <Path
        d="M9.5 5.5V4.5A1.5 1.5 0 0 1 11 3h2a1.5 1.5 0 0 1 1.5 1.5v1"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Tapered bin */}
      <Path
        d="M5 5.5l1.6 13.3a2 2 0 0 0 2 1.7h6.8a2 2 0 0 0 2-1.7L19 5.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
