import Svg, { Circle } from "react-native-svg";

import type { IconType } from "@/types/icon";

export default function ThreeDotIcon({
  size = 24,
  color = "currentColor",
  ...props
}: IconType) {
  return (
    <Svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill={color}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <Circle cx="10" cy="24" r="2" />
      <Circle cx="24" cy="24" r="2" />
      <Circle cx="38" cy="24" r="2" />
    </Svg>
  );
}
