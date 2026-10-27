import Svg, { Rect } from "react-native-svg";

// Install: npx expo install react-native-svg   (or: npm i react-native-svg && npx pod-install)
//
// Palette: #E8943A orange, #B5651D dark orange, #F7D9A8 cream, #FFFFFF white,
//          #2B2B3A pupil, #F26B8A pink, #3A6FF2 accessory blue

type Pixel = readonly [
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  fillOpacity?: number,
];

const PIXELS: readonly Pixel[] = [
  // Ears
  [2, 1, 1, 1, "#B5651D"],
  [2, 2, 2, 1, "#B5651D"],
  [2, 3, 3, 1, "#E8943A"],
  [13, 1, 1, 1, "#B5651D"],
  [12, 2, 2, 1, "#B5651D"],
  [11, 3, 3, 1, "#E8943A"],

  // Inner ears
  [3, 3, 1, 1, "#F26B8A"],
  [12, 3, 1, 1, "#F26B8A"],

  // Head
  [2, 4, 12, 9, "#E8943A"],
  [3, 3, 10, 1, "#E8943A"],
  [4, 13, 8, 1, "#E8943A"],

  // Forehead stripes
  [7, 3, 1, 2, "#B5651D"],
  [9, 3, 1, 2, "#B5651D"],
  [5, 4, 1, 1, "#B5651D"],
  [11, 4, 1, 1, "#B5651D"],

  // Cheek stripes
  [2, 8, 1, 1, "#B5651D"],
  [13, 8, 1, 1, "#B5651D"],
  [2, 10, 1, 1, "#B5651D"],
  [13, 10, 1, 1, "#B5651D"],

  // Muzzle
  [5, 10, 6, 3, "#F7D9A8"],
  [6, 13, 4, 1, "#F7D9A8"],

  // Eyes (3x2 white + 1x1 pupil)
  [4, 6, 3, 2, "#FFFFFF"],
  [9, 6, 3, 2, "#FFFFFF"],
  [5, 7, 1, 1, "#2B2B3A"],
  [10, 7, 1, 1, "#2B2B3A"],

  // Nose
  [7, 9, 2, 1, "#F26B8A"],

  // Mouth: 4 wide with 1px curve
  [6, 11, 1, 1, "#2B2B3A"],
  [7, 12, 2, 1, "#2B2B3A"],
  [9, 11, 1, 1, "#2B2B3A"],

  // Neck / body
  [4, 14, 8, 2, "#E8943A"],

  // Accessory: blue collar with bell
  [4, 14, 8, 1, "#3A6FF2"],
  [7, 15, 2, 1, "#F7D9A8"],

  // Depth highlights (white overlays)
  [3, 4, 3, 1, "#FFFFFF", 0.2],
  [2, 5, 1, 4, "#FFFFFF", 0.15],
  [6, 3, 1, 1, "#FFFFFF", 0.3],
  [5, 10, 2, 1, "#FFFFFF", 0.4],
  [4, 14, 3, 1, "#FFFFFF", 0.25],
];

export interface PixelCatProps {
  /** Width and height in dp. Defaults to 160. */
  size?: number;
}

export function PixelCat({ size = 160 }: PixelCatProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      {PIXELS.map(([x, y, w, h, fill, opacity], i) => (
        <Rect
          key={i}
          x={x}
          y={y}
          width={w}
          height={h}
          fill={fill}
          fillOpacity={opacity ?? 1}
        />
      ))}
    </Svg>
  );
}
