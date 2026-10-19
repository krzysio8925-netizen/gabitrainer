import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { TRAINER } from '@/backend/trainer';
import type { DietDay } from '@/backend/types';
import { Icon } from '@/components/Icon';
import { Card, Empty, H2, HText, Seg, TabScreen, Txt, styles } from '@/components/ui';
import { shortDate } from '@/lib/dates';
import { num } from '@/lib/format';
import { useApp } from '@/store';
import { color } from '@/theme';

/** Ingredients are written one per line as "Płatki owsiane: 60 g". */
const parseIng = (s: string) => s.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
  const at = l.lastIndexOf(':');
  return at > 0 ? { n: l.slice(0, at).trim(), q: l.slice(at + 1).trim() } : { n: l, q: '' };
});

export default function Dieta() {
  const { diet, dietDay, pickDietDay, eaten, toggleEaten } = useApp();
  const [openMeal, setOpenMeal] = useState<string | null>(null);

  if (!diet) {
    return (
      <TabScreen>
        <H2>Plan żywieniowy</H2>
        <Empty title={`${TRAINER.first} przygotowuje Twój jadłospis`}>Pojawi się tutaj automatycznie, gdy tylko go zapisze.</Empty>
      </TabScreen>
    );
  }

  const days = (['A', 'B', 'C'] as DietDay[]).filter(d => diet.days[d]?.length);
  const day = days.includes(dietDay) ? dietDay : days[0] ?? 'A';
  const meals = diet.days[day] ?? [];
  const sum = (pick: (m: (typeof meals)[number]) => string) =>
    meals.reduce((a, m, i) => eaten[day + i] ? a + num(pick(m)) : a, 0);
  const kcalTarget = Math.round(4 * num(diet.p) + 9 * num(diet.f) + 4 * num(diet.c));
  const macros = [
    { label: 'Białko', val: sum(m => m.p), target: num(diet.p), color: color.accent },
    { label: 'Tłuszcze', val: sum(m => m.f), target: num(diet.f), color: color.s600 },
    { label: 'Węglowodany', val: sum(m => m.c), target: num(diet.c), color: color.n600 },
  ];

  return (
    <TabScreen>
      <View>
        <H2>Plan żywieniowy</H2>
        <Txt size={14} color={color.n700}>Od {TRAINER.first}{diet.updatedAt ? ` · obowiązuje od ${shortDate(diet.updatedAt.toDate())}` : ''}</Txt>
      </View>

      <Card style={{ padding: 20, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <HText size={34} lh={1.3}>{Math.round(sum(m => m.kcal))}</HText>
          <Txt color={color.n700}>/ {kcalTarget} kcal zjedzone</Txt>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {macros.map(m => (
            <View key={m.label} style={{ flex: 1, gap: 6 }}>
              <Txt size={12} color={color.n700}>{m.label}</Txt>
              <Txt size={14} weight={700}>{Math.round(m.val)} <Txt size={14} color={color.n700}>/ {m.target} g</Txt></Txt>
              <View style={{ height: 8, borderRadius: 999, backgroundColor: color.n300, overflow: 'hidden' }}>
                <View style={{ height: '100%', borderRadius: 999, backgroundColor: m.color, width: `${m.target ? Math.min(100, Math.round(m.val / m.target * 100)) : 0}%` }} />
              </View>
            </View>
          ))}
        </View>
      </Card>

      {days.length > 1 && (
        <Seg<DietDay> padV={10} value={day} onChange={d => { pickDietDay(d); setOpenMeal(null); }}
          options={days.map(d => ({ value: d, label: 'Dzień ' + d }))} />
      )}

      <View style={{ gap: 10 }}>
        {meals.map((m, i) => {
          const key = day + i;
          const on = !!eaten[key];
          const ing = parseIng(m.ing ?? '');
          const macroLine = [m.kcal && `${m.kcal} kcal`, m.p && `B ${m.p}`, m.f && `T ${m.f}`, m.c && `W ${m.c}`].filter(Boolean).join(' · ');
          return (
            <View key={key} style={{ borderRadius: 28, backgroundColor: on ? color.s100 : color.surface, paddingVertical: 14, paddingRight: 14, paddingLeft: 18, gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Pressable onPress={() => ing.length && setOpenMeal(openMeal === key ? null : key)} style={{ flex: 1, minWidth: 0 }} accessibilityRole="button" accessibilityState={{ expanded: openMeal === key }}>
                  <Txt size={12} color={color.n700}>{[m.time, m.label].filter(Boolean).join(' · ')}</Txt>
                  <Txt weight={700}>{m.name}</Txt>
                  {!!macroLine && <Txt size={12} color={color.n700}>{macroLine}</Txt>}
                </Pressable>
                <Pressable onPress={() => toggleEaten(key)} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={`Zjedzone: ${m.name}`}
                  style={[styles.circle, { width: 44, height: 44, borderWidth: 2, borderColor: on ? color.s600 : color.n400, backgroundColor: on ? color.s600 : 'transparent' }]}>
                  <Icon name="check" color={on ? color.bg : color.n500} />
                </Pressable>
              </View>
              {openMeal === key && (
                <View style={{ gap: 4, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18, backgroundColor: color.bg }}>
                  {ing.map((x, k) => (
                    <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                      <Txt size={13} style={{ flex: 1 }}>{x.n}</Txt>
                      <Txt size={13} weight={600}>{x.q}</Txt>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {!!diet.note && (
        <View style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 20, backgroundColor: color.s100 }}>
          <Txt size={13} color={color.s800}>{TRAINER.first}: {diet.note}</Txt>
        </View>
      )}
    </TabScreen>
  );
}
