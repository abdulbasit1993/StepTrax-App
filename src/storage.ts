import NativeStepCounter from './specs/NativeStepCounter';

const KEY = 'steptrax.v1';

type Saved = { steps: number; day: string };

const today = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

export async function loadSteps(): Promise<number> {
  try {
    const raw = await NativeStepCounter.getItem(KEY);
    if (!raw) {
      return 0;
    }
    const saved = JSON.parse(raw) as Saved;
    return saved.day === today() && Number.isFinite(saved.steps)
      ? Math.max(0, Math.floor(saved.steps))
      : 0;
  } catch {
    return 0;
  }
}

export function saveSteps(steps: number): void {
  const payload: Saved = { steps, day: today() };
  NativeStepCounter.setItem(KEY, JSON.stringify(payload));
}
