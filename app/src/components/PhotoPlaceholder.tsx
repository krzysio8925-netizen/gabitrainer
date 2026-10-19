import { View } from 'react-native';
import Svg, { Defs, Line, Pattern, Rect } from 'react-native-svg';

import { color } from '@/theme';
import { Txt } from './ui';

/** Diagonal-striped 3:4 slot standing in for a body photo that doesn't exist yet. */
export function PhotoPlaceholder({ label }: { label: string }) {
  return (
    <View style={{ aspectRatio: 3 / 4, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      <Svg style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <Defs>
          <Pattern id="stripes" width={20} height={20} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <Rect width={20} height={20} fill={color.n200} />
            <Line x1={5} y1={0} x2={5} y2={20} stroke={color.n300} strokeWidth={10} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#stripes)" />
      </Svg>
      <Txt size={12} color={color.n700}>{label}</Txt>
    </View>
  );
}
