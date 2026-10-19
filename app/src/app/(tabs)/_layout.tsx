import { Redirect } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/Icon';
import { Txt, styles } from '@/components/ui';
import { useApp } from '@/store';
import { color, shadow } from '@/theme';

const TABS = [
  { name: 'index', href: '/', label: 'Dziś', icon: 'home' },
  { name: 'trening', href: '/trening', label: 'Trening', icon: 'dumbbell' },
  { name: 'dieta', href: '/dieta', label: 'Dieta', icon: 'food' },
  { name: 'postepy', href: '/postepy', label: 'Postępy', icon: 'chart' },
  { name: 'czat', href: '/czat', label: 'Czat', icon: 'chat' },
] as const;

export default function TabLayout() {
  const { onboarded } = useApp();
  const insets = useSafeAreaInsets();
  if (!onboarded) return <Redirect href="/onboarding" />;

  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />
      <TabList asChild>
        <View style={{
          flexDirection: 'row', justifyContent: 'space-around',
          paddingTop: 8, paddingHorizontal: 10, paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: color.n100, borderTopLeftRadius: 28, borderTopRightRadius: 28, boxShadow: shadow.sm,
        }}>
          {TABS.map(t => (
            <TabTrigger key={t.name} name={t.name} href={t.href} asChild>
              <TabButton label={t.label} icon={t.icon} />
            </TabTrigger>
          ))}
        </View>
      </TabList>
    </Tabs>
  );
}

// expo-router types `ref` against the old class View; it still reaches Pressable at runtime via the spread.
function TabButton({ label, icon, isFocused, ...props }: Omit<TabTriggerSlotProps, 'ref'> & { label: string; icon: IconName }) {
  const fg = isFocused ? color.a800 : color.n700;
  return (
    <Pressable {...props} accessibilityRole="tab" accessibilityState={{ selected: isFocused }} style={{ flex: 1, alignItems: 'center', gap: 3, paddingVertical: 6 }}>
      <View style={[styles.circle, { width: 52, height: 30, backgroundColor: isFocused ? color.a200 : 'transparent' }]}>
        <Icon name={icon} color={fg} />
      </View>
      <Txt size={11} weight={600} lh={1.3} color={fg}>{label}</Txt>
    </Pressable>
  );
}
