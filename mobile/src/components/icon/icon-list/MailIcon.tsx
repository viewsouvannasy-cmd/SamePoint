import Svg, { Path, Rect } from "react-native-svg";
import { IconType } from "@/types/icon";

export default function MailIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.6,
  ...props
}: IconType) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Envelope */}
      <Rect
        x={2}
        y={4}
        width={20}
        height={16}
        rx={3.5}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      {/* Flap */}
      <Path
        d="M2.3 6l8.6 6.2a2 2 0 0 0 2.2 0L21.7 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
