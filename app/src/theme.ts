// Organic design system tokens (project/_ds/organic-*/styles.css), ported to React Native.

export const color = {
  bg: '#f5ead8',
  surface: '#ebddc5',
  text: '#201e1d',
  accent: '#c67139',
  accent2: '#7a8a5e',
  divider: 'rgba(32,30,29,0.16)',
  n100: '#f9f4ed',
  n200: '#eee7db',
  n300: '#dcd3c4',
  n400: '#c0b6a5',
  n500: '#a19786',
  n600: '#82796a',
  n700: '#645c50',
  n800: '#474238',
  n900: '#2e2b25',
  a100: '#fff2eb',
  a200: '#ffe1d0',
  a300: '#ffc6a5',
  a400: '#f6a06b',
  a500: '#d67f48',
  a600: '#b2622d',
  a700: '#8c491a',
  a800: '#643312',
  a900: '#402310',
  s100: '#f0fae1',
  s200: '#e1eecc',
  s300: '#ccdbb2',
  s400: '#aebf92',
  s500: '#8fa073',
  s600: '#728157',
  s700: '#56633f',
  s800: '#3d472b',
  s900: '#272e1b',
} as const;

export const font = {
  body: 'Figtree_400Regular',
  bodySemi: 'Figtree_600SemiBold',
  bodyBold: 'Figtree_700Bold',
  heading: 'Caprasimo_400Regular',
  // Caprasimo has no Polish diacritics; these glyphs are drawn in soft Fraunces Black instead.
  headingFallback: 'Fraunces_900Black',
} as const;

export const radius = {
  md: 16,
  lg: 28,
  card: 32, // .card gets --radius-lg × 1.15 in the "rounded frame" layer
  pill: 999,
} as const;

export const shadow = {
  sm: '0 1px 2px rgba(46,43,37,0.14)',
  md: '0 3px 10px rgba(46,43,37,0.16)',
  lg: '0 12px 32px rgba(46,43,37,0.22)',
} as const;
