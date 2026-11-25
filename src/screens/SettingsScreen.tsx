import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import type { SensorKind } from '../hooks/useStepCounter';
import { useTheme } from '../theme/ThemeContext';
import type { Palette } from '../theme/theme';
import { GOAL_STEPS, STRIDE_METERS } from '../utils/helpers';

const SENSOR_LABEL: Record<SensorKind, string> = {
  STEP_DETECTOR: 'Step detector',
  ACCELEROMETER: 'Accelerometer',
  NONE: 'None available',
};

type Props = { source: SensorKind };

export default function SettingsScreen({ source }: Props) {
  const { colors, isDark, setDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title} accessibilityRole="header">
        Settings
      </Text>

      <Text style={styles.sectionTitle}>Appearance</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Dark mode</Text>
            <Text style={styles.rowHint}>Easier on the eyes at night</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={setDark}
            accessibilityLabel="Dark mode"
            trackColor={{ false: colors.trailOff, true: colors.trail }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Tracking</Text>
      <View style={styles.card}>
        <InfoRow
          styles={styles}
          label="Step source"
          value={SENSOR_LABEL[source]}
        />
        <View style={styles.divider} />
        <InfoRow
          styles={styles}
          label="Daily goal"
          value={`${GOAL_STEPS.toLocaleString()} steps`}
        />
        <View style={styles.divider} />
        <InfoRow
          styles={styles}
          label="Stride length"
          value={`${STRIDE_METERS} m`}
        />
      </View>
    </ScrollView>
  );
}

function InfoRow({
  styles,
  label,
  value,
}: {
  styles: ReturnType<typeof makeStyles>;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    content: {
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 24,
    },
    title: { fontSize: 22, fontWeight: '700', color: c.ink },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: c.muted,
      marginTop: 28,
      marginBottom: 10,
    },
    card: {
      backgroundColor: c.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.line,
      paddingHorizontal: 16,
    },
    row: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    rowText: { flex: 1 },
    rowLabel: { fontSize: 16, color: c.ink },
    rowHint: { fontSize: 13, color: c.muted, marginTop: 2 },
    rowValue: { fontSize: 15, color: c.muted },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: c.line },
  });
