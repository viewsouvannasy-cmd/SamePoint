import Svg, { Path } from "react-native-svg";
import { IconType } from "@/types/icon";

export default function ComposeIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.6,
  ...props
}: IconType) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Rounded square with an opening at the top-right */}
      <Path
        d="M14 3H8a5 5 0 0 0-5 5v8a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5v-3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Pencil */}
      <Path
        d="M8 16l.97-3.23L16.4 5.4a1.6 1.6 0 0 1 2.2 2.2l-7.37 7.43L8 16z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
