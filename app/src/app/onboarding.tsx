import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Btn, Field, H1, H2, Input, Seg, Txt, styles } from '@/components/ui';
import { EXPERIENCE, GOALS, WEEKDAYS } from '@/data/sample';
import { useApp } from '@/store';
import { color } from '@/theme';

const BIG = { size: 17, height: 54 } as const;

export default function Onboarding() {
  const { survey, setSurvey, toggleDay, finishOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const next = () => setStep(s => s + 1);
  const enterApp = () => {
    finishOnboarding();
    router.replace('/');
  };

  let body: ReactNode;
  if (step === 0) {
    body = (
      <View style={{ flex: 1, justifyContent: 'space-between', gap: 24 }}>
        <View style={{ height: 330 }}>
          <View style={{ position: 'absolute', left: -40, top: 20, width: 260, height: 260, borderRadius: 130, backgroundColor: color.a300 }} />
          <View style={{ position: 'absolute', right: -30, top: 110, width: 190, height: 190, borderRadius: 95, backgroundColor: color.s300 }} />
          <View style={{ position: 'absolute', left: 150, top: 0, width: 70, height: 70, borderRadius: 35, backgroundColor: color.accent }} />
        </View>
        <View>
          <H1 size={44} style={{ marginBottom: 10 }}>GabiTrainer</H1>
          <Txt size={17} color={color.n800}>Plan treningowy, jadłospis i cotygodniowe raporty. Gabi widzi Twoje postępy na bieżąco i dopasowuje plan.</Txt>
        </View>
        <View style={{ gap: 6 }}>
          <Btn variant="primary" label="Zaczynamy" {...BIG} onPress={next} />
          <Btn variant="ghost" label="Mam już konto" onPress={enterApp} style={{ alignSelf: 'center' }} />
        </View>
      </View>
    );
  } else if (step === 1) {
    body = (
      <View style={{ flex: 1, gap: 18 }}>
        <View>
          <H2 style={{ marginBottom: 6 }}>Jaki jest Twój cel?</H2>
          <Txt color={color.n700}>Wybierz jeden — Gabi dopyta o szczegóły.</Txt>
        </View>
        <View style={{ gap: 10 }}>
          {GOALS.map(([label, sub], i) => {
            const on = survey.goal === i;
            return (
              <Pressable key={label} onPress={() => setSurvey({ goal: i })} accessibilityRole="radio" accessibilityState={{ checked: on }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 18, paddingHorizontal: 20, borderRadius: 24, borderWidth: 2,
                  borderColor: on ? color.accent : 'transparent', backgroundColor: on ? color.a100 : color.surface }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: on ? color.accent : 'transparent', backgroundColor: color.surface, alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: on ? color.accent : color.surface }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt size={16} weight={700}>{label}</Txt>
                  <Txt size={13} color={color.n700}>{sub}</Txt>
                </View>
              </Pressable>
            );
          })}
        </View>
        <View style={{ flex: 1 }} />
        <Btn variant="primary" label="Dalej" {...BIG} onPress={next} />
      </View>
    );
  } else if (step === 2) {
    body = (
      <View style={{ flex: 1, gap: 18 }}>
        <H2>Kilka danych na start</H2>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {([['age', 'Wiek', 'number-pad'], ['height', 'Wzrost (cm)', 'number-pad'], ['weight', 'Waga (kg)', 'decimal-pad']] as const).map(([k, label, kb]) => (
            <View key={k} style={{ flex: 1 }}>
              <Field label={label}><Input keyboardType={kb} value={survey[k]} onChangeText={t => setSurvey({ [k]: t })} /></Field>
            </View>
          ))}
        </View>
        <Field label="Ile masz doświadczenia?">
          <Seg value={survey.exp} onChange={exp => setSurvey({ exp })} options={EXPERIENCE.map((label, i) => ({ value: i, label }))} />
        </Field>
        <Field label="W które dni możesz trenować?">
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {WEEKDAYS.map(d => {
              const on = survey.days.includes(d);
              return (
                <Pressable key={d} onPress={() => toggleDay(d)} accessibilityRole="checkbox" accessibilityState={{ checked: on }}
                  style={[styles.circle, { width: 44, height: 44, backgroundColor: on ? color.s600 : color.surface }]}>
                  <Txt size={13} weight={700} lh={1.2} color={on ? color.bg : color.text}>{d}</Txt>
                </Pressable>
              );
            })}
          </View>
        </Field>
        <Field label="Kontuzje, choroby, czego nie jesz">
          <Input multiline placeholder="np. ból kolana przy wykrokach, nie jem ryb" value={survey.limits} onChangeText={limits => setSurvey({ limits })} />
        </Field>
        <View style={{ flex: 1 }} />
        <Btn variant="primary" label="Wyślij ankietę do Gabi" {...BIG} onPress={next} />
      </View>
    );
  } else {
    body = (
      <View style={{ flex: 1, justifyContent: 'center', gap: 18 }}>
        <View style={[styles.circle, { width: 96, height: 96, backgroundColor: color.s300 }]}><Icon name="check" size={44} color={color.s800} /></View>
        <H2>Ankieta jest u Gabi</H2>
        <Txt size={16} color={color.n800}>Plan treningowy i żywieniowy pojawią się w aplikacji w ciągu 48 godzin. Dostaniesz powiadomienie.</Txt>
        <Btn variant="primary" label="Przejdź do aplikacji" {...BIG} onPress={enterApp} style={{ marginTop: 12 }} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingTop: 12, paddingHorizontal: 24, paddingBottom: 28, gap: 20 }}>
          {(step === 1 || step === 2) && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Btn icon="left" iconOnly label="Wróć" onPress={() => setStep(s => s - 1)} />
              <View style={{ flex: 1, flexDirection: 'row', gap: 6 }}>
                {[1, 2].map(i => <View key={i} style={{ flex: 1, height: 6, borderRadius: 999, backgroundColor: step >= i ? color.accent : color.n300 }} />)}
              </View>
            </View>
          )}
          {body}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
