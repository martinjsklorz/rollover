import { useState } from 'react'
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native'
import type { Settings } from '../settings'
import { loopTime, timeParts, useLoop, type TimeParts } from './time'

type Size = { width: number; height: number }

/**
 * The looping clock. Fills its parent and sizes itself to fit,
 * so the same component is used for the wizard preview and the full screen.
 */
export default function Clock({ settings }: { settings: Settings }) {
  const [size, setSize] = useState<Size | null>(null)
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout
    setSize({ width, height })
  }
  return (
    <View style={styles.fill} onLayout={onLayout}>
      {/* key restarts the loop when before/after change */}
      {size && <LoopingFace key={`${settings.before}/${settings.after}`} settings={settings} size={size} />}
    </View>
  )
}

function LoopingFace({ settings, size }: { settings: Settings; size: Size }) {
  const elapsed = useLoop(settings.before + settings.after)
  const parts = timeParts(loopTime(settings.before, elapsed), settings.hour12)
  return settings.style === 'flip' ? <FlipFace parts={parts} size={size} /> : <SimpleFace parts={parts} size={size} />
}

/* ---------- simple: thin white digits ---------- */

function SimpleFace({ parts, size }: { parts: TimeParts; size: Size }) {
  const fontSize = Math.min(size.width / (parts.ampm ? 6.2 : 5), size.height * 0.5)
  return (
    <View style={styles.row}>
      <Text style={[styles.simple, { fontSize }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.3}>
        {parts.hh}:{parts.mm}:{parts.ss}
      </Text>
      {parts.ampm !== '' && <Text style={[styles.simpleAmPm, { fontSize: fontSize * 0.3, marginLeft: fontSize * 0.12 }]}>{parts.ampm}</Text>}
    </View>
  )
}

/* ---------- flip: split-flap cards ---------- */

function FlipFace({ parts, size }: { parts: TimeParts; size: Size }) {
  const gapRatio = 0.12
  const cardWidth = Math.min((size.width * 0.92) / (3 + 2 * gapRatio), (size.height * 0.8) / 1.2)
  const gap = cardWidth * gapRatio
  return (
    <View style={[styles.row, { alignItems: 'center', gap }]}>
      <FlipCard value={parts.hh} width={cardWidth} corner={parts.ampm} />
      <FlipCard value={parts.mm} width={cardWidth} />
      <FlipCard value={parts.ss} width={cardWidth} />
    </View>
  )
}

function FlipCard({ value, width, corner }: { value: string; width: number; corner?: string }) {
  const height = width * 1.2
  return (
    <View style={[styles.card, { width, height, borderRadius: width * 0.08 }]}>
      <Text style={[styles.cardDigits, { fontSize: width * 0.62 }]}>{value}</Text>
      <View style={[styles.hinge, { top: height / 2 - 1 }]} />
      {!!corner && (
        <Text style={[styles.corner, { fontSize: width * 0.12, top: width * 0.07, left: width * 0.09 }]}>{corner}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' },
  simple: { color: '#fff', fontWeight: '100', fontVariant: ['tabular-nums'] },
  simpleAmPm: { color: '#fff', fontWeight: '300' },
  card: { backgroundColor: '#1c1c1e', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cardDigits: { color: '#f2f2f2', fontWeight: '600', fontVariant: ['tabular-nums'], includeFontPadding: false },
  hinge: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: '#000' },
  corner: { position: 'absolute', color: '#8e8e93', fontWeight: '600' },
})
