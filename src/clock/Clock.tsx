import { useState } from 'react'
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native'
import type { Settings } from '../settings'
import { colors } from '../theme'
import { formatTime, loopTime, timeParts, useLoop, type TimeParts } from './time'

type Size = { width: number; height: number }

/**
 * The looping clock. Fills its parent and sizes itself to fit,
 * so the same component is used for the wizard preview and the full screen.
 * The loop runs from `startedAt`; pass a new value to restart it.
 */
export default function Clock({ settings, startedAt }: { settings: Settings; startedAt: number }) {
  const [size, setSize] = useState<Size | null>(null)
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout
    setSize({ width, height })
  }
  return (
    <View style={styles.fill} onLayout={onLayout}>
      {/* key: a new start shows its first second right away, not the old loop's for a frame */}
      {size && <LoopingFace key={startedAt} settings={settings} startedAt={startedAt} size={size} />}
    </View>
  )
}

function LoopingFace({ settings, startedAt, size }: { settings: Settings; startedAt: number; size: Size }) {
  const elapsed = useLoop(settings.before + settings.after, startedAt)
  const time = loopTime(settings.before, elapsed)
  const parts = timeParts(time, settings.hour12)
  return (
    // screen readers get the time as one name, not the digits and colons one by one
    <View role="timer" aria-label={formatTime(time, settings.hour12)}>
      <View aria-hidden>
        {settings.style === 'flip' ? <FlipFace parts={parts} size={size} /> : <SimpleFace parts={parts} size={size} />}
      </View>
    </View>
  )
}

/* ---------- simple: thin white digits ---------- */

function SimpleFace({ parts, size }: { parts: TimeParts; size: Size }) {
  // The digits' width per point of font size depends on the font, so it's measured: the first
  // render uses a safe guess (hidden), then the digits are sized to fill the width.
  const [widthPerPoint, setWidthPerPoint] = useState<number | null>(null)
  const fontSize = Math.min((size.width * 0.94) / (widthPerPoint ?? (parts.ampm ? 6.2 : 5)), size.height * 0.5)
  const onLayout = (e: LayoutChangeEvent) => {
    const measured = e.nativeEvent.layout.width / fontSize
    // AM and PM differ slightly in width; don't resize the digits for that
    if (!widthPerPoint || Math.abs(measured - widthPerPoint) / widthPerPoint > 0.03) setWidthPerPoint(measured)
  }
  return (
    <View style={[styles.row, !widthPerPoint && styles.measuring]} onLayout={onLayout}>
      <Text style={[styles.simple, { fontSize }]} numberOfLines={1}>
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
        // at least 9 pt, so AM/PM stays readable on the small preview cards
        <Text style={[styles.corner, { fontSize: Math.max(width * 0.12, 9), top: width * 0.07, left: width * 0.09 }]}>
          {corner}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' },
  measuring: { opacity: 0 },
  simple: { color: colors.text, fontWeight: '100', fontVariant: ['tabular-nums'], flexShrink: 0 },
  simpleAmPm: { color: colors.text, fontWeight: '300' },
  card: { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cardDigits: { color: colors.text, fontWeight: '400', fontVariant: ['tabular-nums'], includeFontPadding: false },
  hinge: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: colors.bg },
  corner: { position: 'absolute', color: colors.muted, fontWeight: '600' },
})
