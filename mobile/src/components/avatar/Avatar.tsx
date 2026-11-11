// Avatar.tsx: default profile avatar that matches the logo (Expo / React Native).
// Same user ID => same avatar, every time. Same result as the web version.
//
// Install once:
//   npx expo install react-native-svg
//
// Usage:
//   import Avatar from './Avatar';
//   <Avatar userId={user.id} size={48} />
//   <Avatar userId={user.id} size={96} dark />

import { memo, useMemo } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, {
  Circle as SvgCircle,
  G,
  Line as SvgLine,
  Rect,
} from "react-native-svg";

interface Circle {
  x: number;
  y: number;
  r: number;
}

type Line = [x1: number, y1: number, x2: number, y2: number];

interface AvatarData {
  viewBox: string;
  vx: number;
  vy: number;
  size: number;
  bg: string;
  ink: string;
  circles: Circle[];
  lines: Line[];
}

const LIGHT: readonly string[] = [
  "#FFE9A8",
  "#BFE3F5",
  "#FFC9D6",
  "#CDEBC5",
  "#E4D7FF",
  "#FFD9B8",
];
const DARK: readonly string[] = [
  "#4A3F12",
  "#12384D",
  "#4D1F2E",
  "#1F3F1B",
  "#2F2450",
  "#4D2E12",
];

// string -> 32-bit seed
function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

// seeded random number generator, returns values in [0, 1)
function createRng(seed: string): () => number {
  let a = hashSeed(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function avatarData(id: string, dark: boolean = false): AvatarData {
  const r = createRng(id || "guest");
  const R = 54 + r() * 22; // big circle radius
  const n = 2 + Math.floor(r() * 4); // 2 to 5 small circles
  const a0 = 0.82 + 0.7 + r() * (Math.PI * 2 - 1.4); // skip the logo's own direction
  const spread = Math.max(1.3 + r() * 0.9, (n - 1) * 0.42);
  const hub = { x: Math.cos(a0) * R * 1.1, y: Math.sin(a0) * R * 1.1 };

  const circles: Circle[] = [{ x: 0, y: 0, r: R }];
  const lines: Line[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1) - 0.5;
    const a = a0 + t * spread + (r() - 0.5) * 0.12;
    const d = 230 + r() * 230; // distance from hub
    const cr = 42 + r() * 16; // small circle radius
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    circles.push({ x: hub.x + dx * d, y: hub.y + dy * d, r: cr });
    const len = d - cr - 10; // stop just short of the circle
    lines.push([hub.x, hub.y, hub.x + dx * len, hub.y + dy * len]);
  }

  // centre the drawing and fit it inside a circular crop
  let x0 = Infinity,
    x1 = -Infinity,
    y0 = Infinity,
    y1 = -Infinity;
  for (const c of circles) {
    x0 = Math.min(x0, c.x - c.r);
    x1 = Math.max(x1, c.x + c.r);
    y0 = Math.min(y0, c.y - c.r);
    y1 = Math.max(y1, c.y + c.r);
  }
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  let rad = 0;
  for (const c of circles)
    rad = Math.max(rad, Math.hypot(c.x - cx, c.y - cy) + c.r);
  const half = rad / 0.8;
  const size = half * 2;
  const vx = cx - half;
  const vy = cy - half;

  const pal = dark ? DARK : LIGHT;
  const bg = pal[Math.floor(r() * pal.length)];
  const ink = dark ? "#FFFFFF" : "#000000";

  return {
    viewBox: `${vx} ${vy} ${size} ${size}`,
    vx,
    vy,
    size,
    bg,
    ink,
    circles,
    lines,
  };
}

interface AvatarProps {
  userId: string;
  size?: number;
  dark?: boolean;
  /** Thin ring around the avatar so it never looks like the app logo. */
  ring?: boolean;
  style?: StyleProp<ViewStyle>;
}

function Avatar({
  userId,
  size = 48,
  dark = false,
  ring = true,
  style,
}: AvatarProps) {
  const d = useMemo(() => avatarData(userId, dark), [userId, dark]);

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Profile avatar"
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: size / 2 },
        ring && styles.ring,
        style,
      ]}
    >
      <Svg width={size} height={size} viewBox={d.viewBox}>
        <Rect x={d.vx} y={d.vy} width={d.size} height={d.size} fill={d.bg} />
        <G stroke={d.ink} strokeWidth={14} strokeLinecap="round">
          {d.lines.map((l, i) => (
            <SvgLine key={`l${i}`} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} />
          ))}
        </G>
        <G fill={d.ink}>
          {d.circles.map((c, i) => (
            <SvgCircle key={`c${i}`} cx={c.x} cy={c.y} r={c.r} />
          ))}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: "hidden" },
  ring: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: "rgba(128,128,128,0.6)",
  },
});

export default memo(Avatar);
