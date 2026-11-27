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
import { formatDistance, getGreeting, GOAL_STEPS } from '../utils/helpers';

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
  const { steps, todaySteps, status, source, notice, start, pause, reset } =
    counter;

  const running = status === 'running';
  // Ring card has 24 px screen padding and 20 px inner padding on each side.
  const ringSize = Math.min(width - 48 - 40, 300);
  const remaining = Math.max(0, GOAL_STEPS - todaySteps);
  const percent = Math.min(100, Math.round((todaySteps / GOAL_STEPS) * 100));
  const disabled = status === 'loading' || source === 'NONE';

  const greeting = getGreeting();
  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const primaryLabel = running
    ? 'Pause'
    : status === 'paused' || steps > 0
    ? 'Resume'
    : 'Start';

  const confirmReset = () => {
    if (steps === 0) {
      return;
    }
    Alert.alert(
      'Finish & reset walk?',
      'This walk will be saved to your Sessions log and the walk counter will reset to zero. Your daily total stays intact.',
      [
        { text: 'Keep walking', style: 'cancel' },
        { text: 'Save & Reset', onPress: reset },
      ],
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.greeting} accessibilityRole="header">
            {greeting}
          </Text>
          <Text style={styles.date}>{dateLabel}</Text>
        </View>
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

      <View style={styles.ringCard}>
        <TrailRing value={todaySteps} goal={GOAL_STEPS} size={ringSize}>
          <Text
            style={[styles.heroNumber, { fontSize: ringSize * 0.21 }]}
            accessibilityLiveRegion="polite"
            accessibilityLabel={`${todaySteps} steps today`}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {todaySteps.toLocaleString()}
          </Text>
          <Text style={styles.heroLabel}>steps today</Text>
        </TrailRing>
        <View style={styles.goalRow}>
          <View style={styles.goalPill}>
            <Text style={styles.goalPillText}>{percent}% </Text>
          </View>
          <Text style={styles.goalText}>
            {remaining === 0
              ? 'Daily goal reached'
              : `${remaining.toLocaleString()} steps to your goal`}
          </Text>
        </View>
      </View>

      <View style={styles.tiles}>
        <View style={styles.tile}>
          <Text style={styles.tileLabel}>Current walk</Text>
          <Text style={styles.tileValue} numberOfLines={1} adjustsFontSizeToFit>
            {steps.toLocaleString()}
          </Text>
          <Text style={styles.tileUnit}>steps</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileLabel}>Today's distance</Text>
          <Text style={styles.tileValue} numberOfLines={1} adjustsFontSizeToFit>
            {formatDistance(todaySteps)}
          </Text>
          <Text style={styles.tileUnit}>walked</Text>
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
      gap: 12,
    },
    headerText: { flex: 1 },
    greeting: {
      fontSize: 28,
      fontWeight: '800',
      color: c.ink,
      letterSpacing: -0.5,
    },
    date: { fontSize: 14, color: c.muted, marginTop: 2 },
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
    ringCard: {
      alignItems: 'center',
      marginTop: 24,
      paddingVertical: 24,
      paddingHorizontal: 20,
      borderRadius: 32,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.line,
      elevation: 3,
      shadowColor: c.trail,
      shadowOpacity: 0.12,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
    },
    heroNumber: {
      color: c.ink,
      fontWeight: '300',
      fontVariant: ['tabular-nums'],
      letterSpacing: -1,
    },
    heroLabel: { fontSize: 15, color: c.muted, marginTop: 2 },
    goalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 20,
    },
    goalPill: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: c.trailSoft,
    },
    goalPillText: {
      fontSize: 13,
      fontWeight: '700',
      color: c.trail,
      fontVariant: ['tabular-nums'],
    },
    goalText: { fontSize: 14, color: c.muted },
    tiles: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    tile: {
      flex: 1,
      backgroundColor: c.card,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: c.line,
      paddingVertical: 16,
      paddingHorizontal: 18,
    },
    tileValue: {
      fontSize: 26,
      fontWeight: '800',
      color: c.trail,
      fontVariant: ['tabular-nums'],
      letterSpacing: -0.5,
      marginTop: 6,
    },
    tileLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: c.muted,
    },
    tileUnit: { fontSize: 12, color: c.muted, marginTop: 2 },
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
      minHeight: 64,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.trail,
      elevation: 6,
      shadowColor: c.trail,
      shadowOpacity: 0.35,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
    },
    primaryRunning: {
      backgroundColor: c.ink,
      shadowColor: c.ink,
    },
    primaryText: {
      color: c.onTrail,
      fontSize: 18,
      fontWeight: '700',
    },
    primaryTextRunning: {
      color: c.onInk,
    },
    secondary: {
      flex: 1,
      minHeight: 64,
      borderRadius: 22,
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
