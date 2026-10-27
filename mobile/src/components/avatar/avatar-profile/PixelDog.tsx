import Svg, { Rect } from "react-native-svg";

// Install: npx expo install react-native-svg   (or: npm i react-native-svg && npx pod-install)
//
// Palette: #C98B4F tan, #8A5A2B brown, #F5E1C0 cream, #FFFFFF white,
//          #2B2B3A dark, #E85D75 tongue, #2FBF71 accessory green

type Pixel = readonly [
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  fillOpacity?: number,
];

const PIXELS: readonly Pixel[] = [
  // Floppy ears
  [1, 3, 2, 7, "#8A5A2B"],
  [13, 3, 2, 7, "#8A5A2B"],
  [2, 10, 1, 1, "#8A5A2B"],
  [13, 10, 1, 1, "#8A5A2B"],

  // Body
  [5, 13, 6, 3, "#C98B4F"],

  // Head
  [4, 2, 8, 1, "#C98B4F"],
  [3, 3, 10, 9, "#C98B4F"],
  [4, 12, 8, 1, "#C98B4F"],

  // Forehead spot
  [7, 3, 2, 2, "#8A5A2B"],

  // Muzzle
  [5, 8, 6, 4, "#F5E1C0"],
  [6, 12, 4, 1, "#F5E1C0"],

  // Eyes (3x2 white + 1x1 pupil)
  [4, 5, 3, 2, "#FFFFFF"],
  [9, 5, 3, 2, "#FFFFFF"],
  [5, 6, 1, 1, "#2B2B3A"],
  [10, 6, 1, 1, "#2B2B3A"],

  // Nose
  [7, 8, 2, 2, "#2B2B3A"],

  // Mouth: 4 wide with 1px curve
  [6, 10, 1, 1, "#2B2B3A"],
  [9, 10, 1, 1, "#2B2B3A"],
  [7, 11, 2, 1, "#2B2B3A"],

  // Tongue
  [7, 12, 2, 1, "#E85D75"],

  // Accessory: green bandana
  [4, 13, 8, 1, "#2FBF71"],
  [5, 14, 6, 1, "#2FBF71"],
  [7, 15, 2, 1, "#2FBF71"],

  // Depth highlights (white overlays)
  [4, 3, 3, 1, "#FFFFFF", 0.2],
  [3, 4, 1, 4, "#FFFFFF", 0.15],
  [1, 3, 1, 4, "#FFFFFF", 0.15],
  [13, 3, 1, 4, "#FFFFFF", 0.1],
  [5, 8, 2, 1, "#FFFFFF", 0.4],
  [4, 13, 3, 1, "#FFFFFF", 0.3],
];

export interface PixelDogProps {
  size?: number;
}

export function PixelDog({ size = 160 }: PixelDogProps) {
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
