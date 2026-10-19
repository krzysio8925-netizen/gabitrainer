import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { TRAINER } from '@/backend/trainer';
import { Icon } from '@/components/Icon';
import { B, Btn, Card, CardTitle, Empty, H2, HText, Kicker, Tag, TabScreen, Txt, styles } from '@/components/ui';
import { longDate, stamp, weekdayIndex } from '@/lib/dates';
import { num, pl, thousands } from '@/lib/format';
import { useApp } from '@/store';
import { color } from '@/theme';

const signed = (d: number, unit: string) => (d > 0 ? '+' : d < 0 ? '−' : '') + pl(Math.abs(d)) + ' ' + unit;

export default function Dzis() {
  const app = useApp();
  const { client, plan, diet, todayKey, doneToday, repSentThisWeek, lastReport, week, eaten, dietDay, lastTrainerMsg, reports, user } = app;
  if (!client) return null;

  const first = client.name.split(' ')[0];
  const initials = client.name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
  const daysToSunday = 6 - weekdayIndex(new Date());

  const meals = diet?.days[dietDay] ?? [];
  const eatenMeals = meals.filter((_, i) => eaten[dietDay + i]);
  const kcal = eatenMeals.reduce((a, m) => a + num(m.kcal), 0);
  const kcalTarget = diet ? Math.round(4 * num(diet.p) + 9 * num(diet.f) + 4 * num(diet.c)) : 0;

  const weightDelta = client.lastWeight ? client.lastWeight - client.startWeight : null;
  const waists = [...reports].reverse().map(r => r.circ?.talia).filter((v): v is number => !!v);
  const waistDelta = waists.length >= 2 ? waists[waists.length - 1] - waists[0] : null;
  const today = todayKey && plan ? plan.days[todayKey] : null;

  return (
    <TabScreen gap={14}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Txt size={13} color={color.n700}>{longDate(new Date())}</Txt>
          <H2 size={30} style={{ marginTop: 2 }}>Cześć, {first}</H2>
        </View>
        <View style={[styles.circle, { width: 46, height: 46, backgroundColor: color.s300 }]}>
          <Txt weight={700} color={color.s900}>{initials}</Txt>
        </View>
      </View>

      {plan === null ? (
        <Empty title={`${TRAINER.first} przygotowuje Twój plan`}>Plan treningowy i jadłospis pojawią się tutaj w ciągu 48 godzin od wysłania ankiety.</Empty>
      ) : doneToday ? (
        <View style={{ paddingVertical: 20, paddingHorizontal: 22, borderRadius: 32, backgroundColor: color.s200, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={[styles.circle, { width: 48, height: 48, backgroundColor: color.s600 }]}><Icon name="check" color={color.bg} /></View>
          <View style={{ flex: 1 }}>
            <Txt weight={700}>{doneToday.title} — zapisany</Txt>
            <Txt size={13} color={color.s800}>{thousands(doneToday.volume)} kg objętości · {TRAINER.first} zobaczy go w panelu</Txt>
          </View>
        </View>
      ) : today ? (
        <View style={{ overflow: 'hidden', padding: 22, borderRadius: 32, backgroundColor: color.a700, gap: 6 }}>
          <View style={{ position: 'absolute', right: -40, top: -50, width: 170, height: 170, borderRadius: 85, backgroundColor: color.a600 }} />
          <Txt size={11} color={color.bg} style={{ letterSpacing: 1.1, textTransform: 'uppercase', opacity: 0.85 }}>Dzisiejszy trening</Txt>
          <HText size={26} lh={1.1} color={color.bg}>{today.title}</HText>
          <Txt size={14} color={color.bg} style={{ opacity: 0.9 }}>{today.rows.length} ćwiczeń</Txt>
          <Btn variant="plain" label="Rozpocznij trening" bg={color.bg} fg={color.a800} height={44}
            onPress={() => { app.startLog(todayKey!); router.push('/log'); }}
            style={{ alignSelf: 'flex-start', marginTop: 10, paddingHorizontal: 22 }} />
        </View>
      ) : plan ? (
        <Empty title="Dziś dzień regeneracji">Spacer 8–10 tys. kroków. Plan na cały tydzień znajdziesz w zakładce Trening.</Empty>
      ) : null}

      {!repSentThisWeek ? (
        <Card style={{ padding: 20, gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Kicker color={color.a700}>Raport tygodniowy · Tydz. {week}</Kicker>
            <Tag>{daysToSunday === 0 ? 'dziś' : `za ${daysToSunday} ${daysToSunday === 1 ? 'dzień' : 'dni'}`}</Tag>
          </View>
          <CardTitle size={20}>Czas na podsumowanie tygodnia</CardTitle>
          <Txt size={13} color={color.n800}>Zdjęcia, waga, obwody i samopoczucie. Zajmie ok. 5 minut.</Txt>
          <Btn variant="primary" label="Wypełnij raport" height={44} onPress={() => router.push('/raport')}
            style={{ alignSelf: 'flex-start', paddingHorizontal: 20, marginTop: 4 }} />
        </Card>
      ) : (
        <Card style={{ paddingVertical: 18, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={[styles.circle, { width: 44, height: 44, backgroundColor: color.s300 }]}><Icon name="list" color={color.s800} /></View>
          <View style={{ flex: 1 }}>
            <Txt weight={700}>{lastReport?.reviewedAt ? `${TRAINER.first} sprawdziła Twój raport` : `Raport z tygodnia ${lastReport?.week ?? week} wysłany`}</Txt>
            <Txt size={13} color={color.n700}>{lastReport?.reviewedAt ? 'Jej odpowiedź jest na czacie' : `${TRAINER.first} odpowie w ciągu 2 dni`}</Txt>
          </View>
        </Card>
      )}

      {diet && (
        <Pressable onPress={() => router.navigate('/dieta')} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
          <Card style={{ padding: 20, gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Kicker color={color.s700}>Dieta dziś · Dzień {dietDay}</Kicker>
              <Txt size={13} color={color.n700}>{eatenMeals.length} z {meals.length} posiłków</Txt>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <HText size={30} lh={1.3}>{kcal}</HText>
              <Txt color={color.n700}>/ {kcalTarget} kcal</Txt>
            </View>
            <View style={{ height: 10, borderRadius: 999, backgroundColor: color.n300, overflow: 'hidden' }}>
              <View style={{ height: '100%', borderRadius: 999, backgroundColor: color.s600, width: `${kcalTarget ? Math.min(100, Math.round(kcal / kcalTarget * 100)) : 0}%` }} />
            </View>
          </Card>
        </Pressable>
      )}

      <Pressable onPress={() => router.navigate('/czat')}
        style={({ pressed }) => [{ flexDirection: 'row', gap: 12, paddingVertical: 16, paddingHorizontal: 18, borderRadius: 28, borderWidth: 1.5, borderColor: color.divider, backgroundColor: pressed ? color.n100 : 'transparent' }]}>
        <View style={[styles.circle, { width: 40, height: 40, backgroundColor: color.a300 }]}><HText size={15} color={color.a900}>{TRAINER.first[0]}</HText></View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Txt size={13} color={color.n700}><B color={color.text}>{TRAINER.first}</B>{lastTrainerMsg ? ' · ' + stamp(lastTrainerMsg.createdAt?.toDate()).toLowerCase() : ''}</Txt>
          <Txt size={14} numberOfLines={3}>{lastTrainerMsg?.text ?? `Masz pytanie? Napisz do ${TRAINER.first}.`}</Txt>
        </View>
      </Pressable>

      <Pressable onPress={() => router.navigate('/postepy')} style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 18, borderRadius: 28, backgroundColor: color.a200 }}>
          <Txt size={12} color={color.a800}>Waga od startu</Txt>
          <HText size={26} lh={1.3} color={color.a900}>{weightDelta == null ? '—' : signed(weightDelta, 'kg')}</HText>
        </View>
        <View style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 18, borderRadius: 28, backgroundColor: color.s200 }}>
          <Txt size={12} color={color.s800}>Talia od startu</Txt>
          <HText size={26} lh={1.3} color={color.s900}>{waistDelta == null ? '—' : signed(waistDelta, 'cm')}</HText>
        </View>
      </Pressable>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 8 }}>
        <Txt size={12} color={color.n700} numberOfLines={1} style={{ flex: 1 }}>Zalogowano: {user?.email}</Txt>
        <Btn variant="ghost" label="Wyloguj się" size={13} onPress={app.logout} />
      </View>
    </TabScreen>
  );
}
