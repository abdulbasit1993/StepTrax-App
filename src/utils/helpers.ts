export const GOAL_STEPS = 10000;

/** Average adult stride in metres. Tune it or make it a setting later. */
export const STRIDE_METERS = 0.75;

export const formatDistance = (steps: number): string => {
  const meters = steps * STRIDE_METERS;
  return meters < 1000
    ? `${Math.round(meters)} m`
    : `${(meters / 1000).toFixed(2)} km`;
};
