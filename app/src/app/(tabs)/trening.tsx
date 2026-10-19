import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Btn, Card, CardTitle, H2, H4, Kicker, Tag, TabScreen, Txt, styles } from '@/components/ui';
import { FULL_DAY, PLANS, WEEK } from '@/data/sample';
import { useApp } from '@/store';
import { color } from '@/theme';

const TODAY = 0; // index into WEEK

export default function Trening() {
  const { workoutDone, history } = useApp();
  const [planDay, setPlanDay] = useState(TODAY);
  const pd = WEEK[planDay];
  const items = pd.w ? PLANS[pd.w] : [];

  return (
    <TabScreen>
      <View>
        <H2 style={{ marginBottom: 0 }}>Plan treningowy</H2>
        <Txt size={14} color={color.n700}>Tydzień 8 z 12 · aktualizacja Gabi: 18.10</Txt>
      </View>

      <View style={{ flexDirection: 'row', gap: 6 }}>
        {WEEK.map((d, i) => {
          const on = planDay === i;
          return (
            <Pressable key={d.d} onPress={() => setPlanDay(i)} accessibilityRole="button" accessibilityState={{ selected: on }}
              style={{ flex: 1, alignItems: 'center', gap: 4, paddingTop: 10, paddingBottom: 8, borderRadius: 999, backgroundColor: on ? color.text : i === TODAY ? color.a100 : 'transparent' }}>
              <Txt size={11} lh={1.3} color={on ? color.bg : color.text}>{d.d}</Txt>
              <Txt size={15} lh={1.3} weight={700} color={on ? color.bg : color.text}>{d.n}</Txt>
              <View style={[styles.circle, { width: 20, height: 20, backgroundColor: d.w ? (on ? color.accent : color.a200) : 'transparent' }]}>
                <Txt size={10} lh={1.2} weight={700} color={d.w ? (on ? color.bg : color.a800) : color.n500}>{d.w ?? '·'}</Txt>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Card style={{ padding: 20, gap: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Kicker color={color.a700}>{FULL_DAY[pd.d]}, {pd.n}.10</Kicker>
            <CardTitle size={22}>{pd.title ?? 'Odpoczynek'}</CardTitle>
          </View>
          {planDay === TODAY && <Tag>dziś</Tag>}
        </View>
        {!pd.w && <Txt size={14} color={color.n700}>Dzień regeneracji. Spacer 8–10 tys. kroków.</Txt>}
        <View>
          {items.map((e, i) => (
            <View key={e.name} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 10, borderTopWidth: 1, borderTopColor: color.divider }}>
              <View style={[styles.circle, { width: 26, height: 26, backgroundColor: color.bg }]}>
                <Txt size={12} lh={1.2} weight={700}>{i + 1}</Txt>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Txt weight={600}>{e.name}</Txt>
                {!!e.note && <Txt size={12} color={color.a700}>Gabi: {e.note}</Txt>}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Txt size={13} weight={700}>{e.target}</Txt>
                {!!e.load && <Txt size={13} color={color.n700}>{e.load}</Txt>}
              </View>
            </View>
          ))}
        </View>
        {planDay === TODAY && !workoutDone && (
          <Btn variant="primary" label="Rozpocznij i zapisuj serie" size={16} height={50} onPress={() => router.push('/log')} />
        )}
      </Card>

      <View>
        <H4 style={{ marginTop: 4, marginBottom: 10 }}>Dzienniczek</H4>
        <View style={{ gap: 8 }}>
          {history.map(h => (
            <View key={h.date + h.title} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 24, backgroundColor: color.n100 }}>
              <View style={[styles.circle, { width: 38, height: 38, backgroundColor: color.s200 }]}>
                <Txt weight={700} color={color.s800}>{h.w}</Txt>
              </View>
              <View style={{ flex: 1 }}>
                <Txt size={14} weight={600}>{h.title}</Txt>
                <Txt size={12} color={color.n700}>{h.date} · {h.time}</Txt>
              </View>
              <Txt size={13} weight={600}>{h.vol}</Txt>
            </View>
          ))}
        </View>
      </View>
    </TabScreen>
  );
}
