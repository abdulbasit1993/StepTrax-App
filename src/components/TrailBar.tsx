import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';

const SEGMENTS = 20;

type Props = { value: number; goal: number };

/** A goal bar drawn as a trail of 20 stops; the next stop fills as you approach it. */
export default function TrailBar({ value, goal }: Props) {
  const progress = Math.min(1, value / goal) * SEGMENTS;

  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Daily step goal"
      accessibilityValue={{ min: 0, max: goal, now: Math.min(value, goal) }}
    >
      {Array.from({ length: SEGMENTS }, (_, i) => {
        const fill = Math.max(0, Math.min(1, progress - i));
        return (
          <View key={i} style={styles.segment}>
            <View style={[styles.fill, { opacity: fill }]} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.trailOff,
    overflow: 'hidden',
  },
  fill: { flex: 1, backgroundColor: colors.trail },
});
