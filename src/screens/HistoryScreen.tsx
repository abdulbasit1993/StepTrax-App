import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { getDateKey, WalkSession } from '../storage';
import { useTheme } from '../theme/ThemeContext';
import type { Palette } from '../theme/theme';
import { formatDistance, GOAL_STEPS } from '../utils/helpers';

type Props = {
  dailyHistory: Record<string, number>;
  sessions: WalkSession[];
};

type DailyRow = {
  date: string;
  steps: number;
};

function formatDisplayDate(dateStr: string): string {
  const today = getDateKey();
  if (dateStr === today) {
    return 'Today';
  }
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTimeRange(startMs: number, endMs: number): string {
  const fmt = (ms: number) =>
    new Date(ms).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  return startMs === endMs ? fmt(startMs) : `${fmt(startMs)} - ${fmt(endMs)}`;
}

export default function HistoryScreen({ dailyHistory, sessions }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [tab, setTab] = useState<'daily' | 'sessions'>('daily');

  const dailyList: DailyRow[] = useMemo(() => {
    return Object.entries(dailyHistory)
      .map(([date, steps]) => ({ date, steps }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [dailyHistory]);

  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        History
      </Text>

      <View style={styles.segmentWrap}>
        <Pressable
          style={[styles.segmentBtn, tab === 'daily' && styles.segmentActive]}
          onPress={() => setTab('daily')}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.segmentText,
              tab === 'daily' && styles.segmentTextActive,
            ]}
          >
            Daily ({dailyList.length})
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.segmentBtn,
            tab === 'sessions' && styles.segmentActive,
          ]}
          onPress={() => setTab('sessions')}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.segmentText,
              tab === 'sessions' && styles.segmentTextActive,
            ]}
          >
            Sessions ({sessions.length})
          </Text>
        </Pressable>
      </View>

      {tab === 'daily' ? (
        <FlatList
          data={dailyList}
          keyExtractor={item => item.date}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No daily step records yet. Start walking to log your first day!
            </Text>
          }
          renderItem={({ item }) => {
            const goalMet = item.steps >= GOAL_STEPS;
            return (
              <View style={styles.card}>
                <View style={styles.cardLeft}>
                  <Text style={styles.cardPrimary}>
                    {formatDisplayDate(item.date)}
                  </Text>
                  <Text style={styles.cardSecondary}>
                    {formatDistance(item.steps)}
                  </Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.stepCount}>
                    {item.steps.toLocaleString()}
                  </Text>
                  <Text
                    style={[
                      styles.badge,
                      { color: goalMet ? colors.live : colors.muted },
                    ]}
                  >
                    {goalMet
                      ? 'Goal reached'
                      : `${Math.round((item.steps / GOAL_STEPS) * 100)} %`}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No saved walk sessions yet. Tap Reset after a walk on Home to log
              it here.
            </Text>
          }
          renderItem={({ item }) => {
            return (
              <View style={styles.card}>
                <View style={styles.cardLeft}>
                  <Text style={styles.cardPrimary}>
                    {formatDisplayDate(item.date)}
                  </Text>
                  <Text style={styles.cardSecondary}>
                    {formatTimeRange(item.startedAt, item.endedAt)} ·{' '}
                    {formatDistance(item.steps)}
                  </Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.stepCount}>
                    {item.steps.toLocaleString()}
                  </Text>
                  <Text style={styles.badge}>steps</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 12,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: c.ink,
    },
    segmentWrap: {
      flexDirection: 'row',
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 4,
      marginTop: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: c.line,
    },
    segmentBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 9,
      alignItems: 'center',
    },
    segmentActive: {
      backgroundColor: c.trail,
    },
    segmentText: {
      fontSize: 14,
      fontWeight: '600',
      color: c.muted,
    },
    segmentTextActive: {
      color: c.onTrail,
    },
    listContent: {
      paddingBottom: 24,
      gap: 10,
    },
    card: {
      backgroundColor: c.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.line,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cardLeft: {
      flex: 1,
      gap: 4,
    },
    cardPrimary: {
      fontSize: 16,
      fontWeight: '600',
      color: c.ink,
    },
    cardSecondary: {
      fontSize: 13,
      color: c.muted,
    },
    cardRight: {
      alignItems: 'flex-end',
      gap: 2,
    },
    stepCount: {
      fontSize: 18,
      fontWeight: '700',
      color: c.ink,
      fontVariant: ['tabular-nums'],
    },
    badge: {
      fontSize: 12,
      fontWeight: '600',
      color: c.muted,
    },
    emptyText: {
      textAlign: 'center',
      color: c.muted,
      fontSize: 14,
      marginTop: 48,
      lineHeight: 20,
    },
  });
