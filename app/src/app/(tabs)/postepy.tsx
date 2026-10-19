import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Line, Polygon, Polyline } from 'react-native-svg';

import { CIRC } from '@/backend/types';
import { PhotoPlaceholder } from '@/components/PhotoPlaceholder';
import { B, Card, Empty, H2, H4, HText, Seg, TabScreen, Tag, Txt } from '@/components/ui';
import { pl } from '@/lib/format';
import { PHOTO_VIEWS, useApp, type PhotoView } from '@/store';
import { color } from '@/theme';

type MetricKey = 'waga' | 'talia' | 'biodra';
const METRICS: { k: MetricKey; label: string; unit: string }[] = [
  { k: 'waga', label: 'Waga', unit: 'kg' }, { k: 'talia', label: 'Talia', unit: 'cm' }, { k: 'biodra', label: 'Biodra', unit: 'cm' },
];
const COLS = { flexDirection: 'row', gap: 8 } as const;
const signed = (d: number) => (d > 0 ? '+' : d < 0 ? '−' : '') + pl(Math.abs(d));

export default function Postepy() {
  const { client, reports, photo } = useApp();
  const [metric, setMetric] = useState<MetricKey>('waga');
  const [photoView, setPhotoView] = useState<PhotoView>('Przód');
  if (!client) return null;

  const chrono = [...reports].reverse();
  const series: { v: number; l: string }[] = metric === 'waga'
    ? [{ v: client.startWeight, l: 'Start' }, ...chrono.filter(r => r.weight).map(r => ({ v: r.weight, l: 'T' + r.week }))]
    : chrono.filter(r => r.circ?.[metric]).map(r => ({ v: r.circ[metric], l: 'T' + r.week }));
  // Keep the chart readable: at most the last 10 points.
  const pts0 = series.slice(-10);
  const unit = METRICS.find(m => m.k === metric)!.unit;

  const firstCirc = chrono.find(r => r.circ && Object.keys(r.circ).length);
  const lastCirc = [...chrono].reverse().find(r => r.circ && Object.keys(r.circ).length);

  const withPhoto = chrono.filter(r => r.photos?.[photoView]);
  const pair = withPhoto.length >= 2 ? [withPhoto[0], withPhoto[withPhoto.length - 1]] : withPhoto;

  return (
    <TabScreen>
      <H2>Postępy</H2>
      <Seg<MetricKey> padV={10} value={metric} onChange={setMetric} options={METRICS.map(m => ({ value: m.k, label: m.label }))} />

      {pts0.length < 2 ? (
        <Empty title="Wykres pojawi się po pierwszych raportach">Każdy raport tygodniowy dodaje punkt na wykresie wagi i obwodów.</Empty>
      ) : (() => {
        const v = pts0.map(p => p.v);
        const mn = Math.min(...v) - 0.5, mx = Math.max(...v) + 0.5;
        const pts = pts0.map((p, i) => ({ ...p, x: 5 + i * 300 / (pts0.length - 1), y: 20 + (mx - p.v) / (mx - mn) * 120, r: i === pts0.length - 1 ? 6 : 4 }));
        const line = pts.map(p => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ');
        return (
          <Card style={{ padding: 20, gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
              <HText size={34} lh={1.3}>{pl(v[v.length - 1])} {unit}</HText>
              <Tag variant="accent2" size={13}>{signed(v[v.length - 1] - series[0].v)} {unit} od startu</Tag>
            </View>
            <Svg width="100%" viewBox="0 0 310 160" style={{ aspectRatio: 310 / 160, overflow: 'visible' }}>
              {[20, 80, 140].map(y => <Line key={y} x1={0} x2={310} y1={y} y2={y} stroke={color.divider} strokeDasharray="3 5" />)}
              <Polygon points={line + ` ${pts[pts.length - 1].x},160 5,160`} fill={color.a200} />
              <Polyline points={line} fill="none" stroke={color.accent} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
              {pts.map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r={p.r} fill={color.bg} stroke={color.accent} strokeWidth={3} />)}
            </Svg>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {pts.map((p, i) => <Txt key={i} size={11} color={color.n700}>{p.l}</Txt>)}
            </View>
          </Card>
        );
      })()}

      {firstCirc && lastCirc && (
        <Card style={{ paddingVertical: 8, paddingHorizontal: 20, gap: 0 }}>
          <View style={[COLS, { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: color.divider }]}>
            {['Obwód', 'Start', 'Teraz', 'Zmiana'].map((h, i) => (
              <Txt key={h} size={11} color={color.n700} style={{ flex: i === 0 ? 1.3 : 1, letterSpacing: 0.88, textTransform: 'uppercase', textAlign: i === 3 ? 'right' : 'left' }}>{h}</Txt>
            ))}
          </View>
          {CIRC.filter(c => firstCirc.circ[c.k] && lastCirc.circ[c.k]).map(c => {
            const s = firstCirc.circ[c.k], n = lastCirc.circ[c.k];
            return (
              <View key={c.k} style={[COLS, { alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: color.divider }]}>
                <Txt size={14} weight={600} style={{ flex: 1.3 }}>{c.label}</Txt>
                <Txt size={14} style={{ flex: 1 }}>{pl(s)}</Txt>
                <Txt size={14} style={{ flex: 1 }}>{pl(n)}</Txt>
                <View style={{ flex: 1, alignItems: 'flex-end' }}><Tag variant={n - s > 0 ? 'accent' : 'accent2'}>{signed(n - s)}</Tag></View>
              </View>
            );
          })}
        </Card>
      )}

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
        {pair.length === 0 ? (
          <Txt size={14} color={color.n700}>Zdjęcia z raportów pojawią się tutaj, pierwsze obok najnowszego.</Txt>
        ) : (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {pair.map(r => {
              const uri = photo(r.photos[photoView]);
              return (
                <View key={r.id} style={{ flex: 1, gap: 6 }}>
                  {uri
                    ? <Image source={{ uri }} contentFit="cover" style={{ aspectRatio: 3 / 4, borderRadius: 28 }} />
                    : <PhotoPlaceholder label="wczytywanie…" />}
                  <Txt size={12} color={color.n700}><B color={color.text}>Tydzień {r.week}</B> · {pl(r.weight)} kg</Txt>
                </View>
              );
            })}
            {pair.length === 1 && <View style={{ flex: 1 }} />}
          </View>
        )}
      </View>
    </TabScreen>
  );
}
