import { useEffect, useState } from "react";
import {
  View,
  Animated,
  Easing,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";

// Smooth bump (0 -> 1 -> 0) sampled at a few points, so no easing function
// is needed and everything runs on the native driver.
const SAMPLES = 8;
const BUMP_X = Array.from({ length: SAMPLES + 1 }, (_, k) => k / SAMPLES);
const BUMP_Y = BUMP_X.map((x) => Math.pow(Math.sin(Math.PI * x), 2));

/**
 * Animated loading dots that look right for any dot count.
 *
 * Timing is defined per dot in milliseconds (not as a share of the whole
 * cycle), so 2, 3, 5 or 8 dots all get the same rhythm. The full cycle is:
 *   bounceDuration + (count - 1) * stagger + pause
 * All dots are driven by ONE animation value, so they never drift apart.
 *
 * Props:
 *  - count:          number of dots (default 3)
 *  - size:           dot diameter (default 10)
 *  - color:          dot color (default '#4F46E5')
 *  - spacing:        gap between dots (default size * 0.6)
 *  - variant:        'bounce' | 'pulse' | 'fade' (default 'bounce')
 *                    bounce = hops up (chat typing), pulse = grows + fades,
 *                    fade = opacity only (buttons, tight spaces)
 *  - bounceDuration: ms one dot takes to go up and down (default 450)
 *  - stagger:        ms delay between neighbouring dots (default 140)
 *  - pause:          ms rest after the last dot, before restarting (default 250)
 *  - lift:           bounce height (default size * 0.8)
 *  - style:          extra style for the container
 */
type LoadingDotsProps = {
  count?: number;
  size?: number;
  color?: string;
  spacing?: number;
  variant?: "bounce" | "pulse" | "fade";
  bounceDuration?: number;
  stagger?: number;
  pause?: number;
  lift?: number;
  style?: StyleProp<ViewStyle>;
};

export default function LoadingDots({
  count = 3,
  size = 10,
  color = "#4F46E5",
  spacing,
  variant = "bounce",
  bounceDuration = 450,
  stagger = 140,
  pause = 250,
  lift,
  style,
}: LoadingDotsProps) {
  const [progress] = useState(() => new Animated.Value(0));

  const gap = spacing ?? size * 0.6;
  const hop = lift ?? size * 0.8;
  const total = bounceDuration + Math.max(count - 1, 0) * stagger + pause;

  useEffect(() => {
    progress.setValue(0);
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: total,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [progress, total]);

  const containerHeight = variant === "bounce" ? size + hop : size * 1.4;

  return (
    <View
      style={[styles.row, { height: containerHeight }, style]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      {Array.from({ length: count }, (_, i) => {
        const start = (i * stagger) / total;
        const span = bounceDuration / total;
        const bump = progress.interpolate({
          inputRange: BUMP_X.map((x) => start + x * span),
          outputRange: BUMP_Y,
          extrapolate: "clamp",
        });

        const opacity = bump.interpolate({
          inputRange: [0, 1],
          outputRange: variant === "fade" ? [0.25, 1] : [0.4, 1],
        });

        const transform: any[] = [];
        if (variant === "bounce") {
          transform.push({
            translateY: bump.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -hop],
            }),
          });
        } else if (variant === "pulse") {
          transform.push({
            scale: bump.interpolate({
              inputRange: [0, 1],
              outputRange: [0.7, 1.2],
            }),
          });
        }

        return (
          <Animated.View
            key={i}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              marginHorizontal: gap / 2,
              opacity,
              transform,
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },
});

// Usage:
// <LoadingDots />
// <LoadingDots count={5} />
// <LoadingDots variant="pulse" color="#10B981" />
// <LoadingDots variant="fade" size={6} count={3} />   // inside a button
