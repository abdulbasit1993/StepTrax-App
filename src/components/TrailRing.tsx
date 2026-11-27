import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SAMPLES = 120; // resolution of the head-dot path

type Props = {
  value: number;
  goal: number;
  size: number;
  children?: React.ReactNode; // rendered in the centre
};

/**
 * Goal ring: a smooth gradient arc with rounded caps, a soft glow and a
 * glowing head dot. Progress animates in on mount and eases on every update.
 */
export default function TrailRing({ value, goal, size, children }: Props) {
  const { colors } = useTheme();

  const stroke = size * 0.075;
  const center = size / 2;
  // Leave room for the glow, which is wider than the arc itself.
  const radius = center - stroke;
  const circumference = 2 * Math.PI * radius;

  const target = Math.max(0, Math.min(1, goal > 0 ? value / goal : 0));
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: target,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // SVG props are not supported by the native driver
    });
    animation.start();

    return () => animation.stop();
  }, [progress, target]);

  const dashOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  // Hide the arc and head dot at zero so round caps don't leave a stray dot.
  const visible = progress.interpolate({
    inputRange: [0, 0.002],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const glowOpacity = progress.interpolate({
    inputRange: [0, 0.002],
    outputRange: [0, 0.22],
    extrapolate: 'clamp',
  });

  // Head dot follows the end of the arc.
  const { inputRange, xRange, yRange } = useMemo(() => {
    const input: number[] = [];
    const xs: number[] = [];
    const ys: number[] = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const p = i / SAMPLES;
      const angle = (-90 + p * 360) * (Math.PI / 180);
      input.push(p);
      xs.push(center + radius * Math.cos(angle));
      ys.push(center + radius * Math.sin(angle));
    }
    return { inputRange: input, xRange: xs, yRange: ys };
  }, [center, radius]);

  const headX = progress.interpolate({ inputRange, outputRange: xRange });
  const headY = progress.interpolate({ inputRange, outputRange: yRange });

  const arcProps = {
    cx: center,
    cy: center,
    r: radius,
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeDasharray: `${circumference} ${circumference}`,
    rotation: -90,
    origin: `${center}, ${center}`,
  };

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Daily step goal"
      accessibilityValue={{ min: 0, max: goal, now: Math.min(value, goal) }}
    >
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="trailGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.trail} />
            <Stop offset="1" stopColor={colors.trailEnd} />
          </LinearGradient>
        </Defs>

        {/* Track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={colors.trailOff}
          strokeWidth={stroke}
        />

        {/* Glow */}
        <AnimatedCircle
          {...arcProps}
          stroke="url(#trailGradient)"
          strokeWidth={stroke * 1.9}
          strokeDashoffset={dashOffset}
          opacity={glowOpacity}
        />

        {/* Progress arc */}
        <AnimatedCircle
          {...arcProps}
          stroke="url(#trailGradient)"
          strokeWidth={stroke}
          strokeDashoffset={dashOffset}
          opacity={visible}
        />

        {/* Head dot */}
        <AnimatedCircle
          cx={headX}
          cy={headY}
          r={stroke * 0.3}
          fill="#FFFFFF"
          opacity={visible}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '22%',
  },
});
