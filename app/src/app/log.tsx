import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { B, BackHeader, Btn, Card, CardTitle, Input, Tag, Txt, styles } from '@/components/ui';
import { LOG } from '@/data/sample';
import { useApp } from '@/store';
import { color } from '@/theme';

const GRID = { flexDirection: 'row', alignItems: 'center', gap: 8 } as const;
const COL_SET = 36, COL_BTN = 44;

export default function Log() {
  const { log, setSet, addSet, tick, elapsed, elapsedLabel, volume, finishWorkout } = useApp();

  // The clock runs only while this screen is in front, as in the design.
  useFocusEffect(useCallback(() => {
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [tick]));

  const doneEx = LOG.filter(e => log[e.id].every(x => x.done)).length;

  const finish = () => {
    finishWorkout(elapsed, volume);
    router.dismissTo('/');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <BackHeader title="Trening B — Dół ciała" sub={`${doneEx} z ${LOG.length} ćwiczeń ukończonych`} onBack={() => router.back()}
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, backgroundColor: color.a100 }}>
            <Icon name="clock" size={16} color={color.a800} />
            <Txt weight={700} lh={1.3} color={color.a800} style={{ fontVariant: ['tabular-nums'] }}>{elapsedLabel}</Txt>
          </View>
        } />

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 12 }}>
        {LOG.map(e => {
          const sets = log[e.id];
          const dc = sets.filter(x => x.done).length;
          return (
            <Card key={e.id} style={{ padding: 18, gap: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                <View style={{ flex: 1 }}><CardTitle>{e.name}</CardTitle></View>
                <Tag variant={dc === sets.length ? 'accent2' : 'neutral'}>{dc}/{sets.length}</Tag>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 4 }}>
                <Txt size={12} color={color.n700}>Cel: <B color={color.text}>{e.target}</B></Txt>
                <Txt size={12} color={color.n700}>Ostatnio: {e.last}</Txt>
              </View>
              {!!e.note && (
                <View style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, backgroundColor: color.a100 }}>
                  <Txt size={12} color={color.a800}>Gabi: {e.note}</Txt>
                </View>
              )}

              <View style={[GRID, { paddingHorizontal: 2 }]}>
                {['Seria', e.time ? '—' : 'kg', e.time ? 'sek.' : 'powt.'].map((h, i) => (
                  <Txt key={i} size={11} color={color.n700} style={[{ letterSpacing: 0.66, textTransform: 'uppercase' }, i === 0 ? { width: COL_SET } : { flex: 1 }]}>{h}</Txt>
                ))}
                <View style={{ width: COL_BTN }} />
              </View>

              {sets.map((x, i) => (
                <View key={i} style={[GRID, { paddingVertical: 4, paddingHorizontal: 2, borderRadius: 999, backgroundColor: x.done ? color.s200 : 'transparent' }]}>
                  <Txt weight={700} style={{ width: COL_SET, textAlign: 'center' }}>{i + 1}</Txt>
                  <Input keyboardType="decimal-pad" value={x.kg} onChangeText={kg => setSet(e.id, i, { kg })} editable={!e.time}
                    accessibilityLabel={`Seria ${i + 1}, ciężar`} style={{ flex: 1, height: 40, textAlign: 'center', fontFamily: 'Figtree_600SemiBold' }} />
                  <Input keyboardType="number-pad" value={x.reps} onChangeText={reps => setSet(e.id, i, { reps })}
                    accessibilityLabel={`Seria ${i + 1}, ${e.time ? 'sekundy' : 'powtórzenia'}`} style={{ flex: 1, height: 40, textAlign: 'center', fontFamily: 'Figtree_600SemiBold' }} />
                  <Pressable onPress={() => setSet(e.id, i, { done: !x.done })} accessibilityRole="checkbox" accessibilityState={{ checked: x.done }} accessibilityLabel={`Seria ${i + 1} zrobiona`}
                    style={[styles.circle, { width: COL_BTN, height: COL_BTN, backgroundColor: x.done ? color.s600 : color.bg }]}>
                    <Icon name="check" color={x.done ? color.bg : color.n500} />
                  </Pressable>
                </View>
              ))}

              <Btn variant="ghost" icon="plus" iconSize={16} label="Dodaj serię" onPress={() => addSet(e.id)} style={{ alignSelf: 'flex-start' }} />
            </Card>
          );
        })}
        <Btn variant="primary" label="Zakończ i zapisz trening" size={17} height={54} onPress={finish} style={{ marginTop: 4 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
