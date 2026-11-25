import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';

const TICKS = 40;

type Props = {
  value: number;
  goal: number;
  size: number;
  children?: React.ReactNode; // rendered in the centre
};

/** Goal ring drawn as 40 trail stops; the next stop fades in as you approach it. */
export default function TrailRing({ value, goal, size, children }: Props) {
  const { colors } = useTheme();
  const progress = Math.min(1, value / goal) * TICKS;
  const stroke = Math.max(5, size * 0.022);
  const center = size / 2;
  const outer = center - stroke;
  const inner = outer - size * 0.07;

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Daily step goal"
      accessibilityValue={{ min: 0, max: goal, now: Math.min(value, goal) }}
    >
      <Svg width={size} height={size}>
        {Array.from({ length: TICKS }, (_, i) => {
          const angle = (-90 + (i * 360) / TICKS) * (Math.PI / 180);
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const fill = Math.max(0, Math.min(1, progress - i));
          const coords = {
            x1: center + inner * cos,
            y1: center + inner * sin,
            x2: center + outer * cos,
            y2: center + outer * sin,
            strokeWidth: stroke,
            strokeLinecap: 'round' as const,
          };
          return (
            <React.Fragment key={i}>
              <Line {...coords} stroke={colors.trailOff} />
              {fill > 0 && (
                <Line {...coords} stroke={colors.trail} opacity={fill} />
              )}
            </React.Fragment>
          );
        })}
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
