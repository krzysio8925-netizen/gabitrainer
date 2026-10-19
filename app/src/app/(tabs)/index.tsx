import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { B, Btn, Card, CardTitle, H2, HText, Kicker, Tag, TabScreen, Txt, styles } from '@/components/ui';
import { CLIENT, KCAL_TARGET, MEALS, TODAY_LABEL } from '@/data/sample';
import { thousands } from '@/lib/format';
import { useApp } from '@/store';
import { color } from '@/theme';

export default function Dzis() {
  const { workoutDone, volume, repSent, eaten, msgs } = useApp();

  // The dashboard always tracks diet day A, whichever day is open on the Dieta tab.
  const eatenA = MEALS.A.filter((_, i) => eaten['A' + i]);
  const kcal = eatenA.reduce((a, m) => a + m.kcal, 0);
  const lastTrainerMsg = [...msgs].reverse().find(m => !m.me)?.text ?? '';

  return (
    <TabScreen gap={14}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <View>
          <Txt size={13} color={color.n700}>{TODAY_LABEL}</Txt>
          <H2 size={30} style={{ marginTop: 2 }}>Cześć, {CLIENT.first}</H2>
        </View>
        <View style={[styles.circle, { width: 46, height: 46, backgroundColor: color.s300 }]}>
          <Txt weight={700} color={color.s900}>{CLIENT.initials}</Txt>
        </View>
      </View>

      {!workoutDone ? (
        <View style={{ overflow: 'hidden', padding: 22, borderRadius: 32, backgroundColor: color.a700, gap: 6 }}>
          <View style={{ position: 'absolute', right: -40, top: -50, width: 170, height: 170, borderRadius: 85, backgroundColor: color.a600 }} />
          <Txt size={11} color={color.bg} style={{ letterSpacing: 1.1, textTransform: 'uppercase', opacity: 0.85 }}>Dzisiejszy trening</Txt>
          <HText size={26} lh={1.1} color={color.bg}>B — Dół ciała</HText>
          <Txt size={14} color={color.bg} style={{ opacity: 0.9 }}>5 ćwiczeń · ok. 55 min</Txt>
          <Btn variant="plain" label="Rozpocznij trening" bg={color.bg} fg={color.a800} height={44} onPress={() => router.push('/log')}
            style={{ alignSelf: 'flex-start', marginTop: 10, paddingHorizontal: 22 }} />
        </View>
      ) : (
        <View style={{ paddingVertical: 20, paddingHorizontal: 22, borderRadius: 32, backgroundColor: color.s200, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={[styles.circle, { width: 48, height: 48, backgroundColor: color.s600 }]}><Icon name="check" color={color.bg} /></View>
          <View style={{ flex: 1 }}>
            <Txt weight={700}>Trening B zapisany</Txt>
            <Txt size={13} color={color.s800}>{thousands(volume)} kg objętości · Gabi zobaczy go w panelu</Txt>
          </View>
        </View>
      )}

      {!repSent ? (
        <Card style={{ padding: 20, gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Kicker color={color.a700}>Raport tygodniowy · Tydz. 8</Kicker>
            <Tag>za 6 dni</Tag>
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
            <Txt weight={700}>Raport z tygodnia 8 wysłany</Txt>
            <Txt size={13} color={color.n700}>Gabi odpowie do wtorku</Txt>
          </View>
        </Card>
      )}

      <Pressable onPress={() => router.navigate('/dieta')} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
        <Card style={{ padding: 20, gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Kicker color={color.s700}>Dieta dziś · Dzień A</Kicker>
            <Txt size={13} color={color.n700}>{eatenA.length} z 5 posiłków</Txt>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <HText size={30} lh={1.3}>{kcal}</HText>
            <Txt color={color.n700}>/ {KCAL_TARGET} kcal</Txt>
          </View>
          <View style={{ height: 10, borderRadius: 999, backgroundColor: color.n300, overflow: 'hidden' }}>
            <View style={{ height: '100%', borderRadius: 999, backgroundColor: color.s600, width: `${Math.min(100, Math.round(kcal / KCAL_TARGET * 100))}%` }} />
          </View>
        </Card>
      </Pressable>

      <Pressable onPress={() => router.navigate('/czat')}
        style={({ pressed }) => [{ flexDirection: 'row', gap: 12, paddingVertical: 16, paddingHorizontal: 18, borderRadius: 28, borderWidth: 1.5, borderColor: color.divider, backgroundColor: pressed ? color.n100 : 'transparent' }]}>
        <View style={[styles.circle, { width: 40, height: 40, backgroundColor: color.a300 }]}><HText size={15} color={color.a900}>G</HText></View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Txt size={13} color={color.n700}><B color={color.text}>Gabi</B> · dziś 08:12</Txt>
          <Txt size={14}>{lastTrainerMsg}</Txt>
        </View>
      </Pressable>

      <Pressable onPress={() => router.navigate('/postepy')} style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 18, borderRadius: 28, backgroundColor: color.a200 }}>
          <Txt size={12} color={color.a800}>Waga od startu</Txt>
          <HText size={26} lh={1.3} color={color.a900}>−3,2 kg</HText>
        </View>
        <View style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 18, borderRadius: 28, backgroundColor: color.s200 }}>
          <Txt size={12} color={color.s800}>Talia od startu</Txt>
          <HText size={26} lh={1.3} color={color.s900}>−5 cm</HText>
        </View>
      </Pressable>
    </TabScreen>
  );
}
