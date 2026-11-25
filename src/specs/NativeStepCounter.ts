import type { TurboModule, CodegenTypes } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type StepEvent = {
  steps: number;
  source: string;
};

export interface Spec extends TurboModule {
  getSensorType(): Promise<string>;

  start(initialSteps: number, forceAccelerometer: boolean): Promise<string>;

  pause(): void;

  reset(): void;

  getItem(key: string): Promise<string>;

  setItem(key: string, value: string): void;

  readonly onStepUpdate: CodegenTypes.EventEmitter<StepEvent>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeStepCounter');
