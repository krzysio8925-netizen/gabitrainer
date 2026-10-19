import Slider from '@react-native-community/slider';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { BackHeader, Btn, Field, H2, H4, HText, Input, Tag, Txt, styles } from '@/components/ui';
import { CIRC, PREV_WEIGHT } from '@/data/sample';
import { pl } from '@/lib/format';
import { PHOTO_VIEWS, useApp, type PhotoView, type ScaleKey } from '@/store';
import { color } from '@/theme';

const SCALES: [ScaleKey, string, string][] = [
  ['mood', 'Samopoczucie', '1 słabo · 5 świetnie'],
  ['sleep', 'Sen', '1 słabo · 5 świetnie'],
  ['stress', 'Stres', '1 niski · 5 wysoki'],
];

const pairs = <T,>(xs: T[]) => Array.from({ length: Math.ceil(xs.length / 2) }, (_, i) => xs.slice(i * 2, i * 2 + 2));

export default function Raport() {
  const { rep, setRep, repSent, sendReport } = useApp();

  const nPh = PHOTO_VIEWS.filter(v => rep.photos[v]).length;
  const repDone = [nPh === 3, !!rep.weight, CIRC.every(c => rep.circ[c.k]), Object.keys(rep.scales).length === 3, true, !!rep.q.trim()].filter(Boolean).length;
  const cannotSend = !(nPh === 3 && rep.weight);

  const pickPhoto = async (view: PhotoView) => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [3, 4], quality: 0.8 });
    if (!res.canceled) setRep({ photos: { ...rep.photos, [view]: res.assets[0].uri } });
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <BackHeader title="Raport tygodniowy" sub="Tydzień 8 · 19–25.10" onBack={() => router.back()}
        right={<Tag variant="accent2" size={12}>{repDone}/6</Tag>} />

      {repSent ? (
        <View style={{ flex: 1, paddingTop: 20, paddingHorizontal: 24, paddingBottom: 28, justifyContent: 'center', gap: 16 }}>
          <View style={[styles.circle, { width: 96, height: 96, backgroundColor: color.s300 }]}><Icon name="check" size={44} color={color.s800} /></View>
          <H2>Raport wysłany</H2>
          <Txt size={16} color={color.n800}>Gabi przejrzy zdjęcia i pomiary do wtorku i w razie potrzeby zmieni plan. Odpowiedź dostaniesz na czacie.</Txt>
          <Btn variant="primary" label="Wróć do pulpitu" size={17} height={54} onPress={() => router.dismissTo('/')} style={{ marginTop: 8 }} />
        </View>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28, gap: 22 }}>
            <View style={{ gap: 10 }}>
              <H4>1. Zdjęcia sylwetki</H4>
              <Txt size={13} color={color.n700}>Rano, na czczo, w tym samym miejscu i świetle.</Txt>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {PHOTO_VIEWS.map(v => {
                  const uri = rep.photos[v];
                  return (
                    <Pressable key={v} onPress={() => pickPhoto(v)} accessibilityRole="button" accessibilityLabel={`Zdjęcie: ${v}`}
                      style={{ flex: 1, aspectRatio: 3 / 4, borderRadius: 24, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', gap: 6,
                        borderWidth: 2, borderStyle: uri ? 'solid' : 'dashed', borderColor: uri ? color.s600 : color.n400, backgroundColor: uri ? color.s200 : color.n100 }}>
                      {uri && <Image source={{ uri }} contentFit="cover" style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.94 }} />}
                      <View style={[{ alignItems: 'center', gap: 6 }, uri && { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, backgroundColor: color.s200 }]}>
                        <Icon name={uri ? 'check' : 'camera'} color={uri ? color.s800 : color.n700} />
                        <Txt size={13} weight={600} lh={1.3} color={uri ? color.s800 : color.n700}>{uri ? v + ' ✓' : v}</Txt>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={{ gap: 10 }}>
              <H4>2. Waga</H4>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Input keyboardType="decimal-pad" placeholder="np. 69,0" value={rep.weight} onChangeText={weight => setRep({ weight })}
                  accessibilityLabel="Waga w kg" style={{ width: 160, height: 50, fontSize: 18, fontFamily: 'Figtree_700Bold' }} />
                <Txt weight={600}>kg</Txt>
                <Txt size={13} color={color.n700}>poprzednio {PREV_WEIGHT}</Txt>
              </View>
            </View>

            <View style={{ gap: 10 }}>
              <H4>3. Obwody (cm)</H4>
              {pairs(CIRC).map(row => (
                <View key={row[0].k} style={{ flexDirection: 'row', gap: 10 }}>
                  {row.map(c => (
                    <View key={c.k} style={{ flex: 1 }}>
                      <Field label={`${c.label} · poprz. ${pl(c.n)}`}>
                        <Input keyboardType="decimal-pad" value={rep.circ[c.k] ?? ''} onChangeText={t => setRep({ circ: { ...rep.circ, [c.k]: t } })}
                          style={{ height: 44, fontFamily: 'Figtree_600SemiBold' }} />
                      </Field>
                    </View>
                  ))}
                  {row.length === 1 && <View style={{ flex: 1 }} />}
                </View>
              ))}
            </View>

            <View style={{ gap: 14 }}>
              <H4>4. Jak minął tydzień?</H4>
              {SCALES.map(([key, label, hint]) => (
                <View key={key} style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Txt size={13} weight={700}>{label}</Txt>
                    <Txt size={13} color={color.n700}>{hint}</Txt>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {[1, 2, 3, 4, 5].map(v => {
                      const on = rep.scales[key] === v;
                      return (
                        <Pressable key={v} onPress={() => setRep({ scales: { ...rep.scales, [key]: v } })} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={`${label}: ${v}`}
                          style={[styles.circle, { flex: 1, height: 44, backgroundColor: on ? color.accent : color.surface }]}>
                          <Txt weight={700} lh={1.3} color={on ? color.bg : color.text}>{v}</Txt>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>

            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <H4>5. Trzymanie diety</H4>
                <HText size={22} color={color.a700}>{rep.diet}%</HText>
              </View>
              <Slider minimumValue={0} maximumValue={100} step={5} value={rep.diet} onValueChange={diet => setRep({ diet })}
                minimumTrackTintColor={color.accent} maximumTrackTintColor={color.n400} thumbTintColor={color.accent}
                accessibilityLabel="Trzymanie diety w procentach" />
            </View>

            <View style={{ gap: 10 }}>
              <H4>6. Pytania do Gabi</H4>
              <Input multiline placeholder="Co poszło dobrze, co sprawiło trudność?" value={rep.q} onChangeText={q => setRep({ q })} />
            </View>

            <View style={{ gap: 10 }}>
              <Btn variant="primary" label="Wyślij raport" size={17} height={54} disabled={cannotSend} onPress={sendReport} />
              {cannotSend && <Txt size={12} color={color.n700} style={{ textAlign: 'center' }}>Dodaj 3 zdjęcia i wagę, żeby wysłać.</Txt>}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
