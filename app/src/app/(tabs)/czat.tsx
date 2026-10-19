import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, type ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TRAINER } from '@/backend/trainer';
import { Btn, HText, Input, Txt, styles } from '@/components/ui';
import { stamp } from '@/lib/dates';
import { useApp } from '@/store';
import { color } from '@/theme';

export default function Czat() {
  const { msgs, sendMessage, markChatRead, unreadChat } = useApp();
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);
  const scroller = useRef<ScrollViewInstance>(null);

  useFocusEffect(useCallback(() => {
    setFocused(true);
    return () => setFocused(false);
  }, []));

  // Reading the chat clears the unread dot on the tab.
  useEffect(() => {
    if (focused && unreadChat > 0) markChatRead();
  }, [focused, unreadChat, markChatRead]);

  const send = () => {
    const t = draft;
    setDraft('');
    sendMessage(t).catch(() => setDraft(t));
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ paddingTop: 4, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={[styles.circle, { width: 44, height: 44, backgroundColor: color.a300 }]}><HText size={18} color={color.a900}>{TRAINER.first[0]}</HText></View>
          <View>
            <Txt weight={700}>{TRAINER.first}</Txt>
            <Txt size={12} color={color.n700}>Trenerka · odpowiada zwykle w kilka godzin</Txt>
          </View>
        </View>

        <ScrollView ref={scroller} style={{ flex: 1 }} showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 16, gap: 8, flexGrow: 1 }}
          onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: true })}>
          {msgs.length === 0 && (
            <Txt size={14} color={color.n700} style={{ textAlign: 'center', marginTop: 24 }}>Napisz do {TRAINER.first}, jeśli masz pytanie o trening albo dietę.</Txt>
          )}
          {msgs.map(m => {
            const me = m.from === 'client';
            return (
              <View key={m.id} style={{ alignItems: me ? 'flex-end' : 'flex-start', gap: 3 }}>
                <View style={{
                  maxWidth: '78%', paddingVertical: 10, paddingHorizontal: 14,
                  backgroundColor: me ? color.a700 : color.surface,
                  borderRadius: 22, ...(me ? { borderBottomRightRadius: 6 } : { borderBottomLeftRadius: 6 }),
                }}>
                  <Txt size={14} color={me ? color.bg : color.text}>{m.text}</Txt>
                </View>
                <Txt size={11} lh={1.4} color={color.n600} style={{ paddingHorizontal: 6 }}>{stamp(m.createdAt?.toDate())}</Txt>
              </View>
            );
          })}
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: 8, paddingTop: 10, paddingHorizontal: 16, paddingBottom: 12 }}>
          <Input placeholder={`Napisz do ${TRAINER.first}…`} value={draft} onChangeText={setDraft} onSubmitEditing={send}
            returnKeyType="send" accessibilityLabel="Wiadomość" style={{ flex: 1, height: 44 }} />
          <Btn variant="primary" icon="send" iconSize={16} iconOnly label="Wyślij" onPress={send} disabled={!draft.trim()} style={{ width: 44, height: 44 }} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
