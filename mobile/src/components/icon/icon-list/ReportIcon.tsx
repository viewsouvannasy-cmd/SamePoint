import type { IconType } from "@/types/icon";
import Svg, { Path } from "react-native-svg";

export default function ReportIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  ...props
}: IconType) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Speech bubble with tail */}
      <Path
        d="M7 3H17A4 4 0 0 1 21 7V13A4 4 0 0 1 17 17H15L12 20L9 17H7A4 4 0 0 1 3 13V7A4 4 0 0 1 7 3Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Exclamation line */}
      <Path
        d="M12 7V10.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Exclamation dot */}
      <Path
        d="M12 13.2V13.3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
