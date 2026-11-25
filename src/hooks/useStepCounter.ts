import { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import NativeStepCounter from '../specs/NativeStepCounter';
import { loadSteps, saveSteps } from '../storage';

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
  const [status, setStatus] = useState<Status>('loading');
  const [available, setAvailable] = useState<SensorKind>('NONE');
  const [source, setSource] = useState<SensorKind>('NONE');
  const [notice, setNotice] = useState<string | null>(null);
  const stepsRef = useRef(0);

  // Load the saved count and wire up the native event stream.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [type, saved] = await Promise.all([
        NativeStepCounter.getSensorType(),
        loadSteps(),
      ]);
      if (cancelled) {
        return;
      }
      stepsRef.current = saved;
      setSteps(saved);
      setAvailable(type as SensorKind);
      setSource(type as SensorKind);
      if (type === 'NONE') {
        setNotice('This device has no motion sensor StepTrax can use.');
      }
      setStatus('idle');
    })();

    const subscription = NativeStepCounter.onStepUpdate(event => {
      stepsRef.current = event.steps;
      setSteps(event.steps);
    });

    return () => {
      cancelled = true;
      subscription.remove();
      NativeStepCounter.pause();
    };
  }, []);

  // Persist shortly after the count settles (debounced so we don't write on every step).
  useEffect(() => {
    if (status === 'loading') {
      return;
    }
    const id = setTimeout(() => saveSteps(steps), 400);
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
      setSource(used as SensorKind);
      setStatus('running');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not start counting.');
    }
  }, [available]);

  const pause = useCallback(() => {
    NativeStepCounter.pause();
    setStatus('paused');
  }, []);

  const reset = useCallback(() => {
    NativeStepCounter.reset(); // emits steps = 0 back through onStepUpdate
    stepsRef.current = 0;
    setSteps(0);
    saveSteps(0);
    setStatus(prev => (prev === 'running' ? 'running' : 'idle'));
  }, []);

  return { steps, status, source, notice, start, pause, reset };
}
