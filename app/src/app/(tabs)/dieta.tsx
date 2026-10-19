import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Card, H2, HText, Seg, TabScreen, Txt, styles } from '@/components/ui';
import { MEALS, type DietDay } from '@/data/sample';
import { useApp } from '@/store';
import { color } from '@/theme';

export default function Dieta() {
  const { dietDay, pickDietDay, eaten, toggleEaten } = useApp();
  const [openMeal, setOpenMeal] = useState<string | null>(null);
  const dayMeals = MEALS[dietDay];

  const sum = (pick: (m: (typeof dayMeals)[number]) => number, only?: boolean) =>
    dayMeals.reduce((a, m, i) => (only && !eaten[dietDay + i]) ? a : a + pick(m), 0);
  const macros = [
    { label: 'Białko', val: sum(m => m.p, true), target: sum(m => m.p), color: color.accent },
    { label: 'Tłuszcze', val: sum(m => m.f, true), target: sum(m => m.f), color: color.s600 },
    { label: 'Węglowodany', val: sum(m => m.c, true), target: sum(m => m.c), color: color.n600 },
  ];

  return (
    <TabScreen>
      <View>
        <H2>Plan żywieniowy</H2>
        <Txt size={14} color={color.n700}>Od Gabi · obowiązuje od 12.10</Txt>
      </View>

      <Card style={{ padding: 20, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <HText size={34} lh={1.3}>{sum(m => m.kcal, true)}</HText>
          <Txt color={color.n700}>/ {sum(m => m.kcal)} kcal zjedzone</Txt>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {macros.map(m => (
            <View key={m.label} style={{ flex: 1, gap: 6 }}>
              <Txt size={12} color={color.n700}>{m.label}</Txt>
              <Txt size={14} weight={700}>{m.val} <Txt size={14} color={color.n700}>/ {m.target} g</Txt></Txt>
              <View style={{ height: 8, borderRadius: 999, backgroundColor: color.n300, overflow: 'hidden' }}>
                <View style={{ height: '100%', borderRadius: 999, backgroundColor: m.color, width: `${Math.min(100, Math.round(m.val / m.target * 100))}%` }} />
              </View>
            </View>
          ))}
        </View>
      </Card>

      <Seg<DietDay> padV={10} value={dietDay}
        onChange={d => { pickDietDay(d); setOpenMeal(null); }}
        options={(['A', 'B', 'C'] as const).map(d => ({ value: d, label: 'Dzień ' + d }))} />

      <View style={{ gap: 10 }}>
        {dayMeals.map((m, i) => {
          const key = dietDay + i;
          const on = !!eaten[key];
          return (
            <View key={key} style={{ borderRadius: 28, backgroundColor: on ? color.s100 : color.surface, paddingVertical: 14, paddingRight: 14, paddingLeft: 18, gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Pressable onPress={() => setOpenMeal(openMeal === key ? null : key)} style={{ flex: 1, minWidth: 0 }} accessibilityRole="button" accessibilityState={{ expanded: openMeal === key }}>
                  <Txt size={12} color={color.n700}>{m.time} · {m.label}</Txt>
                  <Txt weight={700}>{m.name}</Txt>
                  <Txt size={12} color={color.n700}>{m.kcal} kcal · B {m.p} · T {m.f} · W {m.c}</Txt>
                </Pressable>
                <Pressable onPress={() => toggleEaten(key)} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={`Zjedzone: ${m.label}`}
                  style={[styles.circle, { width: 44, height: 44, borderWidth: 2, borderColor: on ? color.s600 : color.n400, backgroundColor: on ? color.s600 : 'transparent' }]}>
                  <Icon name="check" color={on ? color.bg : color.n500} />
                </Pressable>
              </View>
              {openMeal === key && (
                <View style={{ gap: 4, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18, backgroundColor: color.bg }}>
                  {m.ing.map(x => (
                    <View key={x.n} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                      <Txt size={13}>{x.n}</Txt>
                      <Txt size={13} weight={600}>{x.q}</Txt>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 20, backgroundColor: color.s100 }}>
        <Txt size={13} color={color.s800}>Gabi: Woda min. 2,5 l dziennie. Posiłki możesz przestawiać w obrębie dnia.</Txt>
      </View>
    </TabScreen>
  );
}
