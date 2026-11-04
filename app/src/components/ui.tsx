import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
  type PressableProps, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { color, font, radius } from '@/theme';
import { Logo } from './Brand';
import { Icon, type IconName } from './Icon';

// ─── text ────────────────────────────────────────────────────────────────

type TxtProps = {
  children?: ReactNode;
  size?: number;
  weight?: 400 | 600 | 700;
  color?: string;
  lh?: number; // line-height as a multiple of size; body text is 1.55
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
};

const bodyFamily = { 400: font.body, 600: font.bodySemi, 700: font.bodyBold };

export function Txt({ children, size = 15, weight = 400, color: c = color.text, lh = 1.55, style, numberOfLines }: TxtProps) {
  return (
    <Text numberOfLines={numberOfLines} style={[{ fontFamily: bodyFamily[weight], fontSize: size, lineHeight: Math.round(size * lh), color: c }, style]}>
      {children}
    </Text>
  );
}

/** Inline bold run inside a Txt, like <b>. */
export const B = ({ children, color: c }: { children: ReactNode; color?: string }) => (
  <Text style={{ fontFamily: font.bodyBold, color: c }}>{children}</Text>
);

// Glyphs Caprasimo doesn't have; they render in Fraunces Black so headings keep Polish letters.
const MISSING = /([ąćęłńśźżĄĆĘŁŃŚŹŻ·−]+)/;

const withFallback = (children: ReactNode): ReactNode => {
  const parts = (Array.isArray(children) ? children : [children]).flatMap(ch =>
    typeof ch === 'string' || typeof ch === 'number' ? String(ch).split(MISSING) : [ch]);
  return parts.map((p, i) =>
    typeof p === 'string' && MISSING.test(p)
      ? <Text key={i} style={{ fontFamily: font.headingFallback }}>{p}</Text>
      : p);
};

type HTextProps = Omit<TxtProps, 'weight'> & { tracking?: boolean };

/** Text in the display face (Caprasimo), with the Polish-glyph fallback. */
export function HText({ children, size = 17, color: c = color.text, lh = 1.12, tracking, style, numberOfLines }: HTextProps) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{ fontFamily: font.heading, fontSize: size, lineHeight: Math.round(size * lh), color: c, letterSpacing: tracking ? -0.015 * size : 0 }, style]}>
      {withFallback(children)}
    </Text>
  );
}

export const H1 = (p: HTextProps) => <HText size={42} tracking {...p} />;
export const H2 = (p: HTextProps) => <HText size={32} tracking {...p} />;
export const H4 = (p: HTextProps) => <HText size={20} tracking {...p} />;

// ─── buttons ─────────────────────────────────────────────────────────────

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'plain';

type BtnProps = Omit<PressableProps, 'style' | 'children'> & {
  variant?: BtnVariant;
  label?: string;
  icon?: IconName;
  iconSize?: number;
  iconOnly?: boolean;
  size?: number; // label font size
  height?: number;
  fg?: string;
  bg?: string;
  style?: StyleProp<ViewStyle>;
};

const btnBg: Record<BtnVariant, [string, string]> = {
  primary: [color.accent, color.a700],
  secondary: ['transparent', 'rgba(32,30,29,0.14)'],
  ghost: ['transparent', 'rgba(198,113,57,0.18)'],
  plain: ['transparent', 'transparent'],
};

const btnFg: Record<BtnVariant, string> = {
  primary: color.bg,
  secondary: color.text,
  ghost: color.accent,
  plain: color.text,
};

export function Btn({ variant = 'secondary', label, icon, iconSize = 22, iconOnly, size = 14, height, fg, bg, style, disabled, ...rest }: BtnProps) {
  const c = fg ?? btnFg[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        variant === 'secondary' && { borderColor: color.divider },
        variant === 'ghost' && { paddingHorizontal: 4.4 },
        iconOnly && styles.btnIcon,
        height != null && { height, paddingVertical: 0 },
        { backgroundColor: bg ?? btnBg[variant][pressed ? 1 : 0] },
        pressed && bg != null && { opacity: 0.85 },
        disabled && { opacity: 0.45 },
        style,
      ]}
      {...rest}>
      {icon && <Icon name={icon} size={iconSize} color={c} />}
      {label && !iconOnly && <HText size={size} lh={1.2} color={c}>{label}</HText>}
    </Pressable>
  );
}

// ─── surfaces ────────────────────────────────────────────────────────────

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export const Kicker = ({ children, color: c = color.accent }: { children: ReactNode; color?: string }) => (
  <Txt size={10} lh={1.55} color={c} style={{ letterSpacing: 1, textTransform: 'uppercase' }}>{children}</Txt>
);

export const CardTitle = ({ children, size = 17 }: { children: ReactNode; size?: number }) => (
  <HText size={size} lh={1.2}>{children}</HText>
);

type TagVariant = 'accent' | 'accent2' | 'neutral';
const tagColors: Record<TagVariant, [string, string]> = {
  accent: [color.a100, color.a800],
  accent2: [color.s100, color.s800],
  neutral: [color.n100, color.n800],
};

export function Tag({ children, variant = 'accent', size = 11 }: { children: ReactNode; variant?: TagVariant; size?: number }) {
  const [bg, fg] = tagColors[variant];
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Txt size={size} lh={1.55} color={fg} style={{ letterSpacing: 0.22 }}>{children}</Txt>
    </View>
  );
}

// ─── forms ───────────────────────────────────────────────────────────────

export function Input({ style, multiline, ...rest }: TextInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      placeholderTextColor={color.n600}
      selectionColor={color.accent}
      cursorColor={color.accent}
      multiline={multiline}
      onFocus={e => { setFocused(true); rest.onFocus?.(e); }}
      onBlur={e => { setFocused(false); rest.onBlur?.(e); }}
      {...rest}
      style={[
        styles.input,
        multiline && styles.textarea,
        focused && { borderColor: color.accent },
        style,
      ]}
    />
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View>
      <Txt size={12} color="rgba(32,30,29,0.7)" lh={1.4} style={{ marginBottom: 5 }}>{label}</Txt>
      {children}
    </View>
  );
}

/** The .seg segmented control: one pill split into equal options. */
export function Seg<T extends string | number>({ options, value, onChange, padV = 7 }: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  padV?: number;
}) {
  return (
    <View style={styles.seg} accessibilityRole="radiogroup">
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            onPress={() => onChange(o.value)}
            style={({ pressed }) => [
              styles.segOpt,
              { paddingVertical: padV },
              i > 0 && { borderLeftWidth: 1, borderLeftColor: color.divider },
              { backgroundColor: on ? color.accent : pressed ? 'rgba(32,30,29,0.07)' : 'transparent' },
            ]}>
            <Txt size={13} lh={1.55} color={on ? color.bg : color.text}>{o.label}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── layout ──────────────────────────────────────────────────────────────

/** A scrolling tab screen with the standard 20px gutter. */
export function TabScreen({ children, gap = 16 }: { children: ReactNode; gap?: number }) {
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 8, paddingHorizontal: 20, paddingBottom: 24, gap }}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

/** Shown while the app checks who is signed in. */
export function Splash() {
  return (
    <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center', gap: 16 }]}>
      <Logo width={230} />
      <ActivityIndicator color={color.accent} />
    </View>
  );
}

/** A soft box for "nothing here yet" states. */
export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <View style={{ padding: 20, borderRadius: radius.card, backgroundColor: color.n100, gap: 6 }}>
      <Txt weight={700}>{title}</Txt>
      {children != null && <Txt size={14} color={color.n700}>{children}</Txt>}
    </View>
  );
}

/** Inline error line under a form. */
export const ErrorText = ({ children }: { children: ReactNode }) => (
  <Txt size={13} color={color.a700} style={{ textAlign: 'center' }}>{children}</Txt>
);

/** Back button + title row used at the top of Log and Raport. */
export function BackHeader({ title, sub, onBack, right }: { title: string; sub: string; onBack: () => void; right?: ReactNode }) {
  return (
    <View style={styles.backHeader}>
      <Btn icon="left" iconOnly onPress={onBack} label="Wróć" />
      <View style={{ flex: 1 }}>
        <Txt weight={700}>{title}</Txt>
        <Txt size={12} color={color.n700}>{sub}</Txt>
      </View>
      {right}
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 8.8, paddingHorizontal: 15.84,
    borderRadius: radius.pill, borderWidth: 1, borderColor: 'transparent',
  },
  btnIcon: { width: 36, height: 36, paddingVertical: 0, paddingHorizontal: 0 },
  card: { backgroundColor: color.surface, borderRadius: radius.card, padding: 13.2, gap: 8.8 },
  tag: { alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 10, borderRadius: radius.pill },
  input: {
    minWidth: 0, minHeight: 36, paddingVertical: 6, paddingHorizontal: 14,
    fontFamily: font.body, fontSize: 14, color: color.text,
    backgroundColor: color.surface, borderWidth: 1, borderColor: color.divider, borderRadius: radius.pill,
  },
  textarea: { minHeight: 90, borderRadius: 20, paddingTop: 10, textAlignVertical: 'top' },
  seg: { flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderColor: color.divider, borderRadius: radius.pill },
  segOpt: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  backHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 6, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: color.bg },
  circle: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
