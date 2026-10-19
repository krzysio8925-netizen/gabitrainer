import { Redirect, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TRAINER } from '@/backend/trainer';
import { Icon } from '@/components/Icon';
import { B, BackHeader, Btn, Card, CardTitle, ErrorText, Input, Tag, Txt, styles } from '@/components/ui';
import { useApp } from '@/store';
import { color } from '@/theme';

const GRID = { flexDirection: 'row', alignItems: 'center', gap: 8 } as const;
const COL_SET = 36, COL_BTN = 44;

export default function Log() {
  const { plan, logKey, logEx, setSet, addSet, tick, elapsedLabel, finishWorkout } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // The clock runs only while this screen is in front.
  useFocusEffect(useCallback(() => {
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [tick]));

  // Opened directly (e.g. after a page refresh) with no workout started.
  if (!logKey || !plan) return <Redirect href="/trening" />;

  const doneEx = logEx.filter(e => e.sets.every(x => x.done)).length;
  const anyDone = logEx.some(e => e.sets.some(x => x.done));

  const finish = async () => {
    setBusy(true); setError('');
    try {
      await finishWorkout();
      router.dismissTo('/');
    } catch {
      setError('Nie udało się zapisać treningu. Sprawdź internet i spróbuj jeszcze raz.');
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <BackHeader title={`Trening ${plan.days[logKey].title}`} sub={`${doneEx} z ${logEx.length} ćwiczeń ukończonych`} onBack={() => router.back()}
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, backgroundColor: color.a100 }}>
            <Icon name="clock" size={16} color={color.a800} />
            <Txt weight={700} lh={1.3} color={color.a800} style={{ fontVariant: ['tabular-nums'] }}>{elapsedLabel}</Txt>
          </View>
        } />

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 12 }}>
        {logEx.map((e, i) => {
          const dc = e.sets.filter(x => x.done).length;
          return (
            <Card key={i} style={{ padding: 18, gap: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                <View style={{ flex: 1 }}><CardTitle>{e.name}</CardTitle></View>
                <Tag variant={dc === e.sets.length ? 'accent2' : 'neutral'}>{dc}/{e.sets.length}</Tag>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 4 }}>
                <Txt size={12} color={color.n700}>Cel: <B color={color.text}>{e.target}</B></Txt>
                <Txt size={12} color={color.n700}>Ostatnio: {e.last}</Txt>
              </View>
              {!!e.note && (
                <View style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, backgroundColor: color.a100 }}>
                  <Txt size={12} color={color.a800}>{TRAINER.first}: {e.note}</Txt>
                </View>
              )}

              <View style={[GRID, { paddingHorizontal: 2 }]}>
                {['Seria', e.time ? '—' : 'kg', e.time ? 'sek.' : 'powt.'].map((h, k) => (
                  <Txt key={k} size={11} color={color.n700} style={[{ letterSpacing: 0.66, textTransform: 'uppercase' }, k === 0 ? { width: COL_SET } : { flex: 1 }]}>{h}</Txt>
                ))}
                <View style={{ width: COL_BTN }} />
              </View>

              {e.sets.map((x, j) => (
                <View key={j} style={[GRID, { paddingVertical: 4, paddingHorizontal: 2, borderRadius: 999, backgroundColor: x.done ? color.s200 : 'transparent' }]}>
                  <Txt weight={700} style={{ width: COL_SET, textAlign: 'center' }}>{j + 1}</Txt>
                  <Input keyboardType="decimal-pad" value={x.kg} onChangeText={kg => setSet(i, j, { kg })} editable={!e.time}
                    accessibilityLabel={`${e.name}, seria ${j + 1}, ciężar`} style={{ flex: 1, height: 40, textAlign: 'center', fontFamily: 'Figtree_600SemiBold' }} />
                  <Input keyboardType="number-pad" value={x.reps} onChangeText={reps => setSet(i, j, { reps })}
                    accessibilityLabel={`${e.name}, seria ${j + 1}, ${e.time ? 'sekundy' : 'powtórzenia'}`} style={{ flex: 1, height: 40, textAlign: 'center', fontFamily: 'Figtree_600SemiBold' }} />
                  <Pressable onPress={() => setSet(i, j, { done: !x.done })} accessibilityRole="checkbox" accessibilityState={{ checked: x.done }} accessibilityLabel={`${e.name}, seria ${j + 1} zrobiona`}
                    style={[styles.circle, { width: COL_BTN, height: COL_BTN, backgroundColor: x.done ? color.s600 : color.bg }]}>
                    <Icon name="check" color={x.done ? color.bg : color.n500} />
                  </Pressable>
                </View>
              ))}

              <Btn variant="ghost" icon="plus" iconSize={16} label="Dodaj serię" onPress={() => addSet(i)} style={{ alignSelf: 'flex-start' }} />
            </Card>
          );
        })}
        {!!error && <ErrorText>{error}</ErrorText>}
        <Btn variant="primary" label={busy ? 'Zapisuję…' : 'Zakończ i zapisz trening'} size={17} height={54} onPress={finish} disabled={busy || !anyDone} style={{ marginTop: 4 }} />
        {!anyDone && <Txt size={12} color={color.n700} style={{ textAlign: 'center' }}>Odhacz co najmniej jedną serię, żeby zapisać trening.</Txt>}
      </ScrollView>
    </SafeAreaView>
  );
}
