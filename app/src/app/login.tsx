import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Btn, ErrorText, Field, H2, Input, Txt, styles } from '@/components/ui';
import { authError, useApp } from '@/store';
import { color } from '@/theme';

export default function Login() {
  const { login, resetPassword, user, client } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  if (user && client) return <Redirect href="/" />;

  const submit = async () => {
    setBusy(true); setError(''); setInfo('');
    try {
      await login(email, password);
      router.replace('/');
    } catch (e) {
      setError(authError(e));
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setError(''); setInfo('');
    if (!email.trim()) { setError('Wpisz najpierw swój e-mail.'); return; }
    try {
      await resetPassword(email);
      setInfo('Wysłaliśmy link do zmiany hasła. Sprawdź skrzynkę (także spam).');
    } catch (e) {
      setError(authError(e));
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, paddingTop: 12, paddingHorizontal: 24, paddingBottom: 28, gap: 18 }}>
          <View style={{ flexDirection: 'row' }}>
            <Btn icon="left" iconOnly label="Wróć" onPress={() => router.canGoBack() ? router.back() : router.replace('/onboarding')} />
          </View>
          <View>
            <H2 style={{ marginBottom: 6 }}>Zaloguj się</H2>
            <Txt color={color.n700}>E-mail i hasło z zakładania konta.</Txt>
          </View>
          <Field label="E-mail"><Input value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" accessibilityLabel="E-mail" /></Field>
          <Field label="Hasło"><Input value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" accessibilityLabel="Hasło" onSubmitEditing={submit} /></Field>
          <Btn variant="ghost" label="Nie pamiętam hasła" onPress={reset} style={{ alignSelf: 'flex-start' }} />
          <View style={{ flex: 1 }} />
          {!!error && <ErrorText>{error}</ErrorText>}
          {!!info && <Txt size={13} color={color.s800} style={{ textAlign: 'center' }}>{info}</Txt>}
          <Btn variant="primary" label={busy ? 'Loguję…' : 'Zaloguj się'} size={17} height={54} onPress={submit} disabled={busy || !email.trim() || !password} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
