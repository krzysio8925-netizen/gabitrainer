import { Redirect, router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Btn, ErrorText, Field, H1, H2, Input, Seg, Txt, styles } from '@/components/ui';
import { TRAINER } from '@/backend/trainer';
import { WEEKDAYS } from '@/lib/dates';
import { authError, useApp } from '@/store';
import { color } from '@/theme';

const BIG = { size: 17, height: 54 } as const;

const GOALS = [
  ['Redukcja tkanki tłuszczowej', 'Mniej kilogramów i centymetrów'],
  ['Budowa mięśni', 'Więcej siły i lepsza sylwetka'],
  ['Siła i sprawność', 'Lepsze wyniki i kondycja'],
  ['Zdrowie i samopoczucie', 'Ruch bez bólu, więcej energii'],
] as const;
const EXPERIENCE = ['Początkujący', 'Średni', 'Zaawansowany'];

export default function Onboarding() {
  const { survey, setSurvey, toggleDay, register, user, client } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const next = () => setStep(s => s + 1);
  const enterApp = () => router.replace('/');

  // Someone already signed in with a profile doesn't need the survey again
  // (from the account step on, the sign-up itself creates that profile).
  if (user && client && step < 3) return <Redirect href="/" />;

  const dataReady = !!(survey.age.trim() && survey.height.trim() && survey.weight.trim() && survey.days.length);
  const accountReady = !!(name.trim() && email.trim() && password.length >= 6 && consent);

  const createAccount = async () => {
    setBusy(true);
    setError('');
    try {
      await register(name, email, password, survey);
      setStep(4);
    } catch (e) {
      setError(authError(e));
    } finally {
      setBusy(false);
    }
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
          <Btn variant="ghost" label="Mam już konto" onPress={() => router.push('/login')} style={{ alignSelf: 'center' }} />
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
          {GOALS.map(([label, sub]) => {
            const on = survey.goal === label;
            return (
              <Pressable key={label} onPress={() => setSurvey({ goal: label })} accessibilityRole="radio" accessibilityState={{ checked: on }}
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
              <Field label={label}><Input keyboardType={kb} value={survey[k]} onChangeText={t => setSurvey({ [k]: t })} accessibilityLabel={label} /></Field>
            </View>
          ))}
        </View>
        <Field label="Ile masz doświadczenia?">
          <Seg value={survey.exp} onChange={exp => setSurvey({ exp })} options={EXPERIENCE.map(label => ({ value: label, label }))} />
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
        <Btn variant="primary" label="Dalej" {...BIG} onPress={next} disabled={!dataReady} />
        {!dataReady && <Txt size={12} color={color.n700} style={{ textAlign: 'center', marginTop: -10 }}>Uzupełnij wiek, wzrost, wagę i dni treningowe.</Txt>}
      </View>
    );
  } else if (step === 3) {
    body = (
      <View style={{ flex: 1, gap: 18 }}>
        <View>
          <H2 style={{ marginBottom: 6 }}>Twoje konto</H2>
          <Txt color={color.n700}>Tym e-mailem i hasłem zalogujesz się na każdym urządzeniu.</Txt>
        </View>
        <Field label="Imię i nazwisko"><Input value={name} onChangeText={setName} autoComplete="name" accessibilityLabel="Imię i nazwisko" /></Field>
        <Field label="E-mail"><Input value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" accessibilityLabel="E-mail" /></Field>
        <Field label="Hasło (min. 6 znaków)"><Input value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" accessibilityLabel="Hasło" /></Field>
        <Pressable onPress={() => setConsent(c => !c)} accessibilityRole="checkbox" accessibilityState={{ checked: consent }} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <View style={[styles.circle, { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: consent ? color.s600 : color.n400, backgroundColor: consent ? color.s600 : 'transparent', marginTop: 2 }]}>
            {consent && <Icon name="check" size={16} color={color.bg} />}
          </View>
          <Txt size={13} color={color.n800} style={{ flex: 1 }}>Zgadzam się, żeby trenerka {TRAINER.fullName} przetwarzała moje dane, w tym wagę, obwody i zdjęcia sylwetki, w celu prowadzenia moich treningów i diety.</Txt>
        </Pressable>
        <View style={{ flex: 1 }} />
        {!!error && <ErrorText>{error}</ErrorText>}
        <Btn variant="primary" label={busy ? 'Zakładam konto…' : 'Wyślij ankietę do Gabi'} {...BIG} onPress={createAccount} disabled={!accountReady || busy} />
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
          {step >= 1 && step <= 3 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Btn icon="left" iconOnly label="Wróć" onPress={() => setStep(s => s - 1)} />
              <View style={{ flex: 1, flexDirection: 'row', gap: 6 }}>
                {[1, 2, 3].map(i => <View key={i} style={{ flex: 1, height: 6, borderRadius: 999, backgroundColor: step >= i ? color.accent : color.n300 }} />)}
              </View>
            </View>
          )}
          {body}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
