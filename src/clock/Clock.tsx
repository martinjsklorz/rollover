import { useState } from 'react'
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native'
import type { Settings } from '../settings'
import { colors, themeOf, type ClockTheme } from '../theme'
import Fireworks from './Fireworks'
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
  const theme = themeOf(settings.theme)
  // from 00:00:00 until the loop starts over
  const afterMidnight = elapsed >= settings.before
  return (
    <>
      {settings.fireworks && afterMidnight && <Fireworks size={size} colors={theme.fireworks} />}
      {settings.style === 'flip' ? <FlipFace parts={parts} size={size} theme={theme} /> : <SimpleFace parts={parts} size={size} theme={theme} />}
    </>
  )
}

/* ---------- simple: thin white digits ---------- */

function SimpleFace({ parts, size, theme }: { parts: TimeParts; size: Size; theme: ClockTheme }) {
  const fontSize = Math.min(size.width / (parts.ampm ? 6.2 : 5), size.height * 0.5)
  const color = { color: theme.text }
  const glow = theme.glow && { textShadowColor: theme.text, textShadowRadius: fontSize * 0.12, textShadowOffset: { width: 0, height: 0 } }
  return (
    <View style={styles.row}>
      <Text style={[styles.simple, color, glow, { fontSize }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.3}>
        {parts.hh}:{parts.mm}:{parts.ss}
      </Text>
      {parts.ampm !== '' && <Text style={[styles.simpleAmPm, color, { fontSize: fontSize * 0.3, marginLeft: fontSize * 0.12 }]}>{parts.ampm}</Text>}
    </View>
  )
}

/* ---------- flip: split-flap cards ---------- */

function FlipFace({ parts, size, theme }: { parts: TimeParts; size: Size; theme: ClockTheme }) {
  const gapRatio = 0.12
  const cardWidth = Math.min((size.width * 0.92) / (3 + 2 * gapRatio), (size.height * 0.8) / 1.2)
  const gap = cardWidth * gapRatio
  return (
    <View style={[styles.row, { alignItems: 'center', gap }]}>
      <FlipCard value={parts.hh} width={cardWidth} theme={theme} corner={parts.ampm} />
      <FlipCard value={parts.mm} width={cardWidth} theme={theme} />
      <FlipCard value={parts.ss} width={cardWidth} theme={theme} />
    </View>
  )
}

function FlipCard({ value, width, theme, corner }: { value: string; width: number; theme: ClockTheme; corner?: string }) {
  const height = width * 1.2
  return (
    <View style={[styles.card, { width, height, borderRadius: width * 0.08, backgroundColor: theme.surface }]}>
      <Text style={[styles.cardDigits, { fontSize: width * 0.62, color: theme.text }]}>{value}</Text>
      <View style={[styles.hinge, { top: height / 2 - 1 }]} />
      {!!corner && (
        <Text style={[styles.corner, { fontSize: width * 0.12, top: width * 0.07, left: width * 0.09, color: theme.muted }]}>{corner}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' },
  simple: { color: colors.text, fontWeight: '100', fontVariant: ['tabular-nums'] },
  simpleAmPm: { color: colors.text, fontWeight: '300' },
  card: { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cardDigits: { color: colors.text, fontWeight: '400', fontVariant: ['tabular-nums'], includeFontPadding: false },
  hinge: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: colors.bg },
  corner: { position: 'absolute', color: colors.muted, fontWeight: '600' },
})
