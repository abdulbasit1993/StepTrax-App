import NativeStepCounter from './specs/NativeStepCounter';

const KEY = 'steptrax.v2';

export type WalkSession = {
  id: string;
  date: string; // YYYY-MM-DD
  startedAt: number; // epoch ms
  endedAt: number; // epoch ms
  steps: number;
}

export type ActiveSession = {
  date: string;
  startedAt: number;
  steps: number;
}

export type StepData = {
  daily: Record<string, number>;
  sessions: WalkSession[];
  activeSession: ActiveSession | null;
}

export const getDateKey = (d = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
} 

const EMPTY_DATA: StepData = {
  daily: {},
  sessions: [],
  activeSession: null,
}

export async function loadStepData(): Promise<StepData> {
  try {
    const raw = await NativeStepCounter.getItem(KEY);
    if (!raw) {
      return { ...EMPTY_DATA };
    }
    const parsed = JSON.parse(raw) as Partial<StepData>;
    return {
      daily: 
        parsed.daily && typeof parsed.daily === 'object' ? parsed.daily : {},
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      activeSession: parsed.activeSession ?? null
    }
  } catch {
    return { ...EMPTY_DATA };
  }
}

export function saveStepData(data: StepData): void {
  NativeStepCounter.setItem(KEY, JSON.stringify(data));
}
