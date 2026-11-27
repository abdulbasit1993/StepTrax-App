import { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import NativeStepCounter from '../specs/NativeStepCounter';
import {
  ActiveSession,
  getDateKey,
  loadStepData,
  saveStepData,
  StepData,
  WalkSession,
} from '../storage';

export type Status = 'loading' | 'idle' | 'running' | 'paused';
export type SensorKind = 'STEP_DETECTOR' | 'ACCELEROMETER' | 'NONE';

async function ensureActivityRecognition(): Promise<boolean> {
  // ACTIVITY_RECOGNITION became a runtime permission in Android 10 (API 29).
  if (Platform.OS !== 'android' || Platform.Version < 29) {
    return true;
  }
  const permission = PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION;
  if (await PermissionsAndroid.check(permission)) {
    return true;
  }
  const result = await PermissionsAndroid.request(permission, {
    title: 'Count your steps',
    message:
      "StepTrax uses your phone's step sensor, which Android protects behind the Physical activity permission.",
    buttonPositive: 'Allow',
    buttonNegative: 'Not now',
  });
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export function useStepCounter() {
  const [steps, setSteps] = useState(0);
  const [todaySteps, setTodaySteps] = useState(0);
  const [dailyHistory, setDailyHistory] = useState<Record<string, number>>({});
  const [sessions, setSessions] = useState<WalkSession[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [available, setAvailable] = useState<SensorKind>('NONE');
  const [source, setSource] = useState<SensorKind>('NONE');
  const [notice, setNotice] = useState<string | null>(null);

  const stepsRef = useRef(0);
  const dataRef = useRef<StepData>({
    daily: {},
    sessions: [],
    activeSession: null,
  });
  const sessionStartRef = useRef<number | null>(null);
  const lastProcessedStepsRef = useRef(0);

  const persist = useCallback((nextData: StepData) => {
    dataRef.current = nextData;
    setDailyHistory({ ...nextData.daily });
    setSessions([...nextData.sessions]);
    setTodaySteps(nextData.daily[getDateKey()] ?? 0);
    saveStepData(nextData);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [type, saved] = await Promise.all([
        NativeStepCounter.getSensorType(),
        loadStepData(),
      ]);
      if (cancelled) {
        return;
      }

      const today = getDateKey();
      let restoredSteps = 0;

      // If an active session exists from a previous day, archive it automatically
      if (saved.activeSession) {
        if (saved.activeSession.date === today) {
          restoredSteps = saved.activeSession.steps;
          sessionStartRef.current = saved.activeSession.startedAt;
        } else if (saved.activeSession.steps > 0) {
          saved.sessions = [
            {
              id: `${saved.activeSession.startedAt}`,
              date: saved.activeSession.date,
              startedAt: saved.activeSession.startedAt,
              endedAt: saved.activeSession.startedAt,
              steps: saved.activeSession.steps,
            },
            ...saved.sessions,
          ];
          saved.activeSession = null;
          saveStepData(saved);
        }
      }

      dataRef.current = saved;
      stepsRef.current = restoredSteps;
      lastProcessedStepsRef.current = restoredSteps;

      setSteps(restoredSteps);
      setDailyHistory(saved.daily);
      setSessions(saved.sessions);
      setTodaySteps(saved.daily[today] ?? 0);
      setAvailable(type as SensorKind);
      setSource(type as SensorKind);

      if (type === 'NONE') {
        setNotice('This device has no motion sensor StepTrax can use.');
      }
      setStatus('idle');
    })();

    const subscription = NativeStepCounter.onStepUpdate(event => {
      const newSessionSteps = Math.max(0, Math.floor(event.steps));
      const delta = Math.max(
        0,
        newSessionSteps - lastProcessedStepsRef.current,
      );
      lastProcessedStepsRef.current = newSessionSteps;
      stepsRef.current = newSessionSteps;
      setSteps(newSessionSteps);

      if (delta > 0) {
        const today = getDateKey();
        const startedAt = sessionStartRef.current ?? Date.now();
        sessionStartRef.current = startedAt;

        const currentDaily = dataRef.current.daily[today] ?? 0;
        const nextDaily = {
          ...dataRef.current.daily,
          [today]: currentDaily + delta,
        };
        const activeSession: ActiveSession = {
          date: today,
          startedAt,
          steps: newSessionSteps,
        };

        dataRef.current = {
          ...dataRef.current,
          daily: nextDaily,
          activeSession,
        };
        setTodaySteps(nextDaily[today]);
        setDailyHistory(nextDaily);
      }
    });

    return () => {
      cancelled = true;
      subscription.remove();
      NativeStepCounter.pause();
    };
  }, []);

  // Debounced disk persistence while walking
  useEffect(() => {
    if (status === 'loading') {
      return;
    }
    const id = setTimeout(() => {
      saveStepData(dataRef.current);
    }, 400);
    return () => clearTimeout(id);
  }, [steps, status]);

  const start = useCallback(async () => {
    if (available === 'NONE') {
      return;
    }
    setNotice(null);
    let forceAccelerometer = available === 'ACCELEROMETER';
    if (available === 'STEP_DETECTOR' && !(await ensureActivityRecognition())) {
      forceAccelerometer = true;
      setNotice(
        'Physical activity access is off, so StepTrax is using the accelerometer. Turn it on in Settings for more accurate counts.',
      );
    }
    try {
      const used = await NativeStepCounter.start(
        stepsRef.current,
        forceAccelerometer,
      );
      if (!sessionStartRef.current) {
        sessionStartRef.current = Date.now();
      }
      setSource(used as SensorKind);
      setStatus('running');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not start counting.');
    }
  }, [available]);

  const pause = useCallback(() => {
    NativeStepCounter.pause();
    saveStepData(dataRef.current);
    setStatus('paused');
  }, []);

  const reset = useCallback(() => {
    const completedSteps = stepsRef.current;
    const startedAt = sessionStartRef.current ?? Date.now();
    const endedAt = Date.now();

    let nextSessions = dataRef.current.sessions;
    if (completedSteps > 0) {
      const finishedSession: WalkSession = {
        id: `${startedAt}-${endedAt}`,
        date: getDateKey(new Date(startedAt)),
        startedAt,
        endedAt,
        steps: completedSteps,
      };
      nextSessions = [finishedSession, ...nextSessions];
    }

    NativeStepCounter.reset();
    stepsRef.current = 0;
    lastProcessedStepsRef.current = 0;
    sessionStartRef.current = status === 'running' ? Date.now() : null;

    setSteps(0);
    persist({
      daily: dataRef.current.daily,
      sessions: nextSessions,
      activeSession:
        status === 'running'
          ? { date: getDateKey(), startedAt: Date.now(), steps: 0 }
          : null,
    });
    setStatus(prev => (prev === 'running' ? 'running' : 'idle'));
  }, [persist, status]);

  return {
    steps,
    todaySteps,
    dailyHistory,
    sessions,
    status,
    source,
    notice,
    start,
    pause,
    reset,
  };
}
