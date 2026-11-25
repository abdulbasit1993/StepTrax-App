import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import TrailRing from '../components/TrailRing';
import { useStepCounter } from '../hooks/useStepCounter';
import { useTheme } from '../theme/ThemeContext';
import type { Palette } from '../theme/theme';
import { formatDistance, GOAL_STEPS } from '../utils/helpers';

const SENSOR_LABEL = {
  STEP_DETECTOR: 'Step detector',
  ACCELEROMETER: 'Accelerometer',
  NONE: 'No sensor',
} as const;

type Props = { counter: ReturnType<typeof useStepCounter> };

export default function HomeScreen({ counter }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const { steps, status, source, notice, start, pause, reset } = counter;

  const running = status === 'running';
  const ringSize = Math.min(width - 48, 320);
  const remaining = Math.max(0, GOAL_STEPS - steps);
  const disabled = status === 'loading' || source === 'NONE';

  const primaryLabel = running
    ? 'Pause'
    : status === 'paused' || steps > 0
    ? 'Resume'
    : 'Start';

  const confirmReset = () => {
    if (steps === 0) {
      return;
    }
    Alert.alert('Reset steps?', "Today's count goes back to zero.", [
      { text: 'Keep steps', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: reset },
    ]);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.brand}>StepTrax</Text>
        <View style={styles.chip}>
          <View
            style={[
              styles.dot,
              { backgroundColor: running ? colors.live : colors.muted },
            ]}
          />
          <Text style={styles.chipText}>{SENSOR_LABEL[source]}</Text>
        </View>
      </View>

      <View style={styles.ringWrap}>
        <TrailRing value={steps} goal={GOAL_STEPS} size={ringSize}>
          <Text
            style={[styles.heroNumber, { fontSize: ringSize * 0.2 }]}
            accessibilityLiveRegion="polite"
            accessibilityLabel={`${steps} steps today`}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {steps.toLocaleString()}
          </Text>
          <Text style={styles.heroLabel}>steps today</Text>
        </TrailRing>
        <Text style={styles.goalText}>
          {remaining === 0
            ? 'Goal reached'
            : `${remaining.toLocaleString()} to your ${GOAL_STEPS.toLocaleString()}-step goal`}
        </Text>
      </View>

      <View style={styles.tiles}>
        <View style={styles.tile}>
          <Text style={styles.tileValue}>{formatDistance(steps)}</Text>
          <Text style={styles.tileLabel}>Distance</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileValue}>
            {Math.min(100, Math.round((steps / GOAL_STEPS) * 100))}%
          </Text>
          <Text style={styles.tileLabel}>Of daily goal</Text>
        </View>
      </View>

      <View style={styles.spacer} />

      {notice && (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>{notice}</Text>
          {notice.startsWith('Physical activity') && (
            <Pressable
              onPress={() => Linking.openSettings()}
              accessibilityRole="button"
            >
              <Text style={styles.noticeLink}>Open app settings</Text>
            </Pressable>
          )}
        </View>
      )}

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={running ? pause : start}
          style={({ pressed }) => [
            styles.primary,
            running && styles.primaryRunning,
            pressed && styles.pressed,
            disabled && styles.disabled,
          ]}
        >
          <Text
            style={[styles.primaryText, running && styles.primaryTextRunning]}
          >
            {primaryLabel}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={confirmReset}
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryText}>Reset</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    content: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    brand: {
      fontSize: 22,
      fontWeight: '700',
      color: c.ink,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.line,
    },
    dot: { width: 8, height: 8, borderRadius: 4 },
    chipText: { fontSize: 13, color: c.ink },
    ringWrap: {
      alignItems: 'center',
      marginTop: 28,
    },
    heroNumber: {
      color: c.ink,
      fontWeight: '300',
      fontVariant: ['tabular-nums'],
    },
    heroLabel: { fontSize: 15, color: c.muted, marginTop: 2 },
    goalText: { marginTop: 16, fontSize: 14, color: c.muted },
    tiles: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 28,
    },
    tile: {
      flex: 1,
      backgroundColor: c.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.line,
    },
    tileValue: {
      fontSize: 26,
      fontWeight: '600',
      color: c.ink,
      fontVariant: ['tabular-nums'],
    },
    tileLabel: {
      fontSize: 13,
      color: c.muted,
      marginTop: 4,
    },
    spacer: { flex: 1, minHeight: 24 },
    notice: {
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: c.danger,
    },
    noticeText: {
      fontSize: 14,
      color: c.ink,
      lineHeight: 20,
    },
    noticeLink: {
      fontSize: 14,
      fontWeight: '600',
      color: c.trail,
      marginTop: 8,
    },
    controls: { flexDirection: 'row', gap: 12 },
    primary: {
      flex: 2,
      minHeight: 60,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.trail,
    },
    primaryRunning: {
      backgroundColor: c.ink,
    },
    primaryText: {
      color: c.onTrail,
      fontSize: 18,
      fontWeight: '600',
    },
    primaryTextRunning: {
      color: c.onInk,
    },
    secondary: {
      flex: 1,
      minHeight: 60,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.line,
    },
    secondaryText: {
      color: c.ink,
      fontSize: 18,
      fontWeight: '600',
    },
    pressed: { opacity: 0.8 },
    disabled: { opacity: 0.4 },
  });
