import { Image } from 'expo-image';
import { View } from 'react-native';

// Brand files from GabiTrainer-logo.zip (assets/brand). expo-image renders SVG on iOS, Android and web.
const LOGO = require('../../assets/brand/logo-plum.svg');
const MARK = require('../../assets/brand/mark-plum.svg');

/** Blush background of the round trainer avatar. */
export const BLUSH = '#F4DED6';
const LOGO_RATIO = 304.3 / 260; // viewBox of logo-plum.svg

/** Full "Gabi Trainer" logo (plum). */
export function Logo({ width = 230 }: { width?: number }) {
  return <Image source={LOGO} style={{ width, aspectRatio: LOGO_RATIO }} contentFit="contain" accessibilityLabel="GabiTrainer" accessible />;
}

/** Round trainer avatar: the plum "G" mark on blush. */
export function TrainerAvatar({ size }: { size: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: BLUSH, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <Image source={MARK} style={{ width: size * 0.64, height: size * 0.64 }} contentFit="contain" accessibilityLabel="Gabi" accessible />
    </View>
  );
}
