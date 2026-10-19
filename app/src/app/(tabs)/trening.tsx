import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import type { WorkoutKey } from '@/backend/types';
import { TRAINER } from '@/backend/trainer';
import { Btn, Card, CardTitle, Empty, H2, H4, Kicker, Tag, TabScreen, Txt, styles } from '@/components/ui';
import { WEEKDAYS, addDays, shortDate, startOfWeek, weekdayFull, weekdayIndex, weekdayShort } from '@/lib/dates';
import { thousands } from '@/lib/format';
import { useApp } from '@/store';
import { color } from '@/theme';

export default function Trening() {
  const { plan, workouts, doneToday, week, startLog } = useApp();
  const now = new Date();
  const todayIdx = weekdayIndex(now);
  const [sel, setSel] = useState(todayIdx);
  const monday = startOfWeek(now);
  const days = WEEKDAYS.map((d, i) => {
    const date = addDays(monday, i);
    const key = plan ? (Object.keys(plan.days) as WorkoutKey[]).find(k => plan.days[k].weekday === d && plan.days[k].rows.length) : undefined;
    return { d, date, key };
  });
  const cur = days[sel];
  const day = cur.key && plan ? plan.days[cur.key] : null;

  return (
    <TabScreen>
      <View>
        <H2 style={{ marginBottom: 0 }}>Plan treningowy</H2>
        <Txt size={14} color={color.n700}>Tydzień {week}{plan?.updatedAt ? ` · aktualizacja ${TRAINER.first}: ${shortDate(plan.updatedAt.toDate())}` : ''}</Txt>
      </View>

      {!plan ? (
        <Empty title={`${TRAINER.first} przygotowuje Twój plan`}>Dostaniesz go w ciągu 48 godzin od wysłania ankiety. Pojawi się tutaj automatycznie.</Empty>
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {days.map((d, i) => {
              const on = sel === i;
              return (
                <Pressable key={d.d} onPress={() => setSel(i)} accessibilityRole="button" accessibilityState={{ selected: on }}
                  style={{ flex: 1, alignItems: 'center', gap: 4, paddingTop: 10, paddingBottom: 8, borderRadius: 999, backgroundColor: on ? color.text : i === todayIdx ? color.a100 : 'transparent' }}>
                  <Txt size={11} lh={1.3} color={on ? color.bg : color.text}>{d.d}</Txt>
                  <Txt size={15} lh={1.3} weight={700} color={on ? color.bg : color.text}>{d.date.getDate()}</Txt>
                  <View style={[styles.circle, { width: 20, height: 20, backgroundColor: d.key ? (on ? color.accent : color.a200) : 'transparent' }]}>
                    <Txt size={10} lh={1.2} weight={700} color={d.key ? (on ? color.bg : color.a800) : color.n500}>{d.key ?? '·'}</Txt>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Card style={{ padding: 20, gap: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Kicker color={color.a700}>{weekdayFull(cur.date)}, {shortDate(cur.date)}</Kicker>
                <CardTitle size={22}>{day?.title ?? 'Odpoczynek'}</CardTitle>
              </View>
              {sel === todayIdx && <Tag>dziś</Tag>}
            </View>
            {!day && <Txt size={14} color={color.n700}>Dzień regeneracji. Spacer 8–10 tys. kroków.</Txt>}
            {day && (
              <View>
                {day.rows.map((e, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 10, borderTopWidth: 1, borderTopColor: color.divider }}>
                    <View style={[styles.circle, { width: 26, height: 26, backgroundColor: color.bg }]}>
                      <Txt size={12} lh={1.2} weight={700}>{i + 1}</Txt>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Txt weight={600}>{e.name}</Txt>
                      {!!e.note && <Txt size={12} color={color.a700}>{TRAINER.first}: {e.note}</Txt>}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Txt size={13} weight={700}>{e.sets} × {e.reps}</Txt>
                      {!!e.load && <Txt size={13} color={color.n700}>{e.load}</Txt>}
                    </View>
                  </View>
                ))}
              </View>
            )}
            {day && sel === todayIdx && !doneToday && (
              <Btn variant="primary" label="Rozpocznij i zapisuj serie" size={16} height={50} onPress={() => { startLog(cur.key!); router.push('/log'); }} />
            )}
          </Card>
        </>
      )}

      <View>
        <H4 style={{ marginTop: 4, marginBottom: 10 }}>Dzienniczek</H4>
        <View style={{ gap: 8 }}>
          {workouts.length === 0 && <Txt size={14} color={color.n700}>Tu pojawią się Twoje zapisane treningi.</Txt>}
          {workouts.map(h => {
            const d = h.createdAt?.toDate() ?? new Date();
            return (
              <View key={h.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 24, backgroundColor: color.n100 }}>
                <View style={[styles.circle, { width: 38, height: 38, backgroundColor: color.s200 }]}>
                  <Txt weight={700} color={color.s800}>{h.key}</Txt>
                </View>
                <View style={{ flex: 1 }}>
                  <Txt size={14} weight={600}>{h.title}</Txt>
                  <Txt size={12} color={color.n700}>{weekdayShort(d)} {shortDate(d)} · {Math.max(1, Math.round(h.seconds / 60))} min</Txt>
                </View>
                <Txt size={13} weight={600}>{thousands(h.volume)} kg</Txt>
              </View>
            );
          })}
        </View>
      </View>
    </TabScreen>
  );
}
