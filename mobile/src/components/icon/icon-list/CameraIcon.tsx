import Svg, { Circle, Path } from "react-native-svg";

import { IconType } from "@/types/icon";

export default function CameraIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.6,
  ...props
}: IconType) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Camera body */}
      <Path
        d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Lens */}
      <Circle
        cx={12}
        cy={12.5}
        r={3.5}
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}
