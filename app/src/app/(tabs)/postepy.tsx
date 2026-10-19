import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Line, Polygon, Polyline } from 'react-native-svg';

import { PhotoPlaceholder } from '@/components/PhotoPlaceholder';
import { B, Card, H2, H4, HText, Seg, TabScreen, Tag, Txt } from '@/components/ui';
import { CIRC, SERIES, type MetricKey } from '@/data/sample';
import { pl } from '@/lib/format';
import { PHOTO_VIEWS, type PhotoView } from '@/store';
import { color } from '@/theme';

const COLS = { flexDirection: 'row', gap: 8 } as const;

export default function Postepy() {
  const [metric, setMetric] = useState<MetricKey>('waga');
  const [photoView, setPhotoView] = useState<PhotoView>('Przód');

  const ser = SERIES[metric], v = ser.v;
  const mn = Math.min(...v) - 0.5, mx = Math.max(...v) + 0.5;
  const pts = v.map((y, i) => ({ x: 5 + i * 300 / 7, y: 20 + (mx - y) / (mx - mn) * 120, r: i === v.length - 1 ? 6 : 4, l: 'T' + (i + 1) }));
  const line = pts.map(p => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ');

  return (
    <TabScreen>
      <H2>Postępy</H2>
      <Seg<MetricKey> padV={10} value={metric} onChange={setMetric}
        options={(Object.keys(SERIES) as MetricKey[]).map(k => ({ value: k, label: SERIES[k].label }))} />

      <Card style={{ padding: 20, gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <HText size={34} lh={1.3}>{pl(v[v.length - 1])} {ser.unit}</HText>
          <Tag variant="accent2" size={13}>−{pl(v[0] - v[v.length - 1])} {ser.unit} od startu</Tag>
        </View>
        <Svg width="100%" viewBox="0 0 310 160" style={{ aspectRatio: 310 / 160, overflow: 'visible' }}>
          {[20, 80, 140].map(y => <Line key={y} x1={0} x2={310} y1={y} y2={y} stroke={color.divider} strokeDasharray="3 5" />)}
          <Polygon points={line + ' 305,160 5,160'} fill={color.a200} />
          <Polyline points={line} fill="none" stroke={color.accent} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
          {pts.map(p => <Circle key={p.l} cx={p.x} cy={p.y} r={p.r} fill={color.bg} stroke={color.accent} strokeWidth={3} />)}
        </Svg>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {pts.map(p => <Txt key={p.l} size={11} color={color.n700}>{p.l}</Txt>)}
        </View>
      </Card>

      <Card style={{ paddingVertical: 8, paddingHorizontal: 20, gap: 0 }}>
        <View style={[COLS, { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: color.divider }]}>
          {['Obwód', 'Start', 'Teraz', 'Zmiana'].map((h, i) => (
            <Txt key={h} size={11} color={color.n700} style={{ flex: i === 0 ? 1.3 : 1, letterSpacing: 0.88, textTransform: 'uppercase', textAlign: i === 3 ? 'right' : 'left' }}>{h}</Txt>
          ))}
        </View>
        {CIRC.map(c => (
          <View key={c.k} style={[COLS, { alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: color.divider }]}>
            <Txt size={14} weight={600} style={{ flex: 1.3 }}>{c.label}</Txt>
            <Txt size={14} style={{ flex: 1 }}>{pl(c.s)}</Txt>
            <Txt size={14} style={{ flex: 1 }}>{pl(c.n)}</Txt>
            <View style={{ flex: 1, alignItems: 'flex-end' }}><Tag variant="accent2">−{pl(c.s - c.n)}</Tag></View>
          </View>
        ))}
      </Card>

      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <H4>Zdjęcia</H4>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {PHOTO_VIEWS.map(l => {
              const on = photoView === l;
              return (
                <Pressable key={l} onPress={() => setPhotoView(l)} accessibilityRole="button" accessibilityState={{ selected: on }}
                  style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: on ? color.text : color.surface }}>
                  <Txt size={12} lh={1.4} color={on ? color.bg : color.text}>{l}</Txt>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[{ week: 'Tydzień 1', weight: '72,4 kg' }, { week: 'Tydzień 8', weight: '69,2 kg' }].map(p => (
            <View key={p.week} style={{ flex: 1, gap: 6 }}>
              <PhotoPlaceholder label={'zdjęcie · ' + photoView.toLowerCase()} />
              <Txt size={12} color={color.n700}><B color={color.text}>{p.week}</B> · {p.weight}</Txt>
            </View>
          ))}
        </View>
      </View>
    </TabScreen>
  );
}
