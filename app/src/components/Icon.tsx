import Svg, { Circle, Path, Rect } from 'react-native-svg';

// Lucide icons at stroke-width 2.75, as the Organic system asks.

const ICONS = {
  home: <><Path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><Path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></>,
  dumbbell: <><Path d="m6.5 6.5 11 11" /><Path d="m21 21-1-1" /><Path d="m3 3 1 1" /><Path d="m18 22 4-4" /><Path d="m2 6 4-4" /><Path d="m3 10 7-7" /><Path d="m14 21 7-7" /></>,
  food: <><Path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><Path d="M7 2v20" /><Path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></>,
  chart: <><Path d="M3 3v16a2 2 0 0 0 2 2h16" /><Path d="m19 9-5 5-4-4-3 3" /></>,
  chat: <Path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  camera: <><Path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><Circle cx="12" cy="13" r="3" /></>,
  check: <Path d="M20 6 9 17l-5-5" />,
  left: <Path d="m15 18-6-6 6-6" />,
  send: <><Path d="m22 2-7 20-4-9-9-4Z" /><Path d="M22 2 11 13" /></>,
  plus: <><Path d="M5 12h14" /><Path d="M12 5v14" /></>,
  clock: <><Circle cx="12" cy="12" r="10" /><Path d="M12 6v6l4 2" /></>,
  list: <><Rect width="8" height="4" x="8" y="2" rx="1" /><Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><Path d="M12 11h4" /><Path d="M12 16h4" /><Path d="M8 11h.01" /><Path d="M8 16h.01" /></>,
};

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 22, color }: { name: IconName; size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.75} strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </Svg>
  );
}
