export type Palette = {
  fog: string; // screen background
  card: string;
  ink: string; // primary text
  muted: string; // secondary text
  trail: string; // brand blue
  trailOff: string; // inactive ticks / switch track
  live: string;
  danger: string;
  line: string;
  onTrail: string; // text on brand-colored buttons
  onInk: string; // text on ink-colored buttons
};

export const lightColors: Palette = {
  fog: '#E8EDF1',
  card: '#FFFFFF',
  ink: '#0E1A24',
  muted: '#5B6B78',
  trail: '#2D5BFF',
  trailOff: '#CBD5DE',
  live: '#1E8E63',
  danger: '#B93A1B',
  line: '#D5DDE4',
  onTrail: '#FFFFFF',
  onInk: '#FFFFFF',
};

export const darkColors: Palette = {
  fog: '#0B141C',
  card: '#142230',
  ink: '#EAF1F6',
  muted: '#8DA0AF',
  trail: '#4A72FF',
  trailOff: '#263949',
  live: '#38C68F',
  danger: '#F0714F',
  line: '#223445',
  onTrail: '#FFFFFF',
  onInk: '#0B141C',
};
