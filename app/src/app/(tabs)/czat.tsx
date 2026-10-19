import { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View, type ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Btn, HText, Input, Txt, styles } from '@/components/ui';
import { useApp } from '@/store';
import { color } from '@/theme';

export default function Czat() {
  const { msgs, sendMessage } = useApp();
  const [draft, setDraft] = useState('');
  const scroller = useRef<ScrollViewInstance>(null);

  const send = () => {
    sendMessage(draft);
    setDraft('');
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ paddingTop: 4, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={[styles.circle, { width: 44, height: 44, backgroundColor: color.a300 }]}><HText size={18} color={color.a900}>G</HText></View>
          <View>
            <Txt weight={700}>Gabi</Txt>
            <Txt size={12} color={color.n700}>Trenerka · odpowiada zwykle w kilka godzin</Txt>
          </View>
        </View>

        <ScrollView ref={scroller} style={{ flex: 1 }} showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 16, gap: 8 }}
          onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: true })}>
          {msgs.map((m, i) => (
            <View key={i} style={{ alignItems: m.me ? 'flex-end' : 'flex-start', gap: 3 }}>
              <View style={{
                maxWidth: '78%', paddingVertical: 10, paddingHorizontal: 14,
                backgroundColor: m.me ? color.a700 : color.surface,
                borderRadius: 22, ...(m.me ? { borderBottomRightRadius: 6 } : { borderBottomLeftRadius: 6 }),
              }}>
                <Txt size={14} color={m.me ? color.bg : color.text}>{m.text}</Txt>
              </View>
              <Txt size={11} lh={1.4} color={color.n600} style={{ paddingHorizontal: 6 }}>{m.time}</Txt>
            </View>
          ))}
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: 8, paddingTop: 10, paddingHorizontal: 16, paddingBottom: 12 }}>
          {/* Photo messages need the backend's file storage. */}
          <Btn icon="camera" iconOnly label="Wyślij zdjęcie" style={{ width: 44, height: 44 }}
            onPress={() => Alert.alert('Zdjęcia w czacie', 'Wysyłanie zdjęć do Gabi pojawi się w kolejnej wersji.')} />
          <Input placeholder="Napisz do Gabi…" value={draft} onChangeText={setDraft} onSubmitEditing={send}
            returnKeyType="send" style={{ flex: 1, height: 44 }} />
          <Btn variant="primary" icon="send" iconSize={16} iconOnly label="Wyślij" onPress={send} style={{ width: 44, height: 44 }} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
