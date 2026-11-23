import { useEffect, useState } from 'react'
import { Animated, Easing, Platform, StyleSheet, Text, View, type LayoutChangeEvent, type ViewStyle } from 'react-native'
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

type Face = { digits: string; corner?: string }

/**
 * One split-flap card. On every change the top flap (old value) falls down onto the hinge,
 * then the bottom flap (new value) swings down from it. Behind them, the static halves show
 * the new value on top and the old value at the bottom, like the real mechanism.
 */
function FlipCard({ value, width, theme, corner }: { value: string; width: number; theme: ClockTheme; corner?: string }) {
  const height = width * 1.2
  const [flip, setFlip] = useState({ from: { digits: value, corner }, to: { digits: value, corner }, n: 0 })
  if (flip.to.digits !== value || flip.to.corner !== corner) {
    setFlip({ from: flip.to, to: { digits: value, corner }, n: flip.n + 1 })
  }
  const half = { width, height, radius: width * 0.08, theme }
  return (
    <View style={{ width, height }}>
      <Half side="top" face={flip.to} {...half} />
      <Half side="bottom" face={flip.from} {...half} />
      {/* keyed so every flip starts from a fresh, unrotated flap */}
      {flip.n > 0 && <Flaps key={flip.n} from={flip.from} to={flip.to} {...half} />}
      <View style={[styles.hinge, { top: height / 2 - 1 }]} />
    </View>
  )
}

const FALL_MS = 160
const LAND_MS = 260
const useNativeDriver = Platform.OS !== 'web'

function Flaps({ from, to, ...half }: { from: Face; to: Face; width: number; height: number; radius: number; theme: ClockTheme }) {
  const [fall] = useState(() => new Animated.Value(0))
  const [land] = useState(() => new Animated.Value(0))
  useEffect(() => {
    const anim = Animated.sequence([
      Animated.timing(fall, { toValue: 1, duration: FALL_MS, easing: Easing.in(Easing.quad), useNativeDriver }),
      Animated.timing(land, { toValue: 1, duration: LAND_MS, easing: Easing.out(Easing.back(1.4)), useNativeDriver }),
    ])
    anim.start()
    return () => anim.stop()
  }, [fall, land])
  const perspective = half.width * 4
  return (
    <>
      <Half
        side="bottom"
        face={to}
        {...half}
        transform={[{ perspective }, { rotateX: land.interpolate({ inputRange: [0, 1], outputRange: ['90deg', '0deg'] }) }]}
        shade={land.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0], extrapolate: 'clamp' })}
      />
      <Half
        side="top"
        face={from}
        {...half}
        transform={[{ perspective }, { rotateX: fall.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-90deg'] }) }]}
        shade={fall.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] })}
      />
    </>
  )
}

type HalfProps = {
  side: 'top' | 'bottom'
  face: Face
  width: number
  height: number
  radius: number
  theme: ClockTheme
  /** rotation around the hinge (the half's edge at the card's middle) */
  transform?: Animated.WithAnimatedValue<ViewStyle>['transform']
  /** darkness of the shadow over the half, 0 … 1 */
  shade?: Animated.AnimatedInterpolation<number>
}

/** The top or bottom half of a card: the full card face, clipped to one half. */
function Half({ side, face, width, height, radius, theme, transform, shade }: HalfProps) {
  const top = side === 'top'
  return (
    <Animated.View
      style={[
        styles.half,
        {
          top: top ? 0 : height / 2,
          backgroundColor: theme.surface,
          height: height / 2,
          transformOrigin: top ? 'bottom' : 'top',
          transform,
          ...(top
            ? { borderTopLeftRadius: radius, borderTopRightRadius: radius }
            : { borderBottomLeftRadius: radius, borderBottomRightRadius: radius }),
        },
      ]}
    >
      <View style={[styles.face, { height, top: top ? 0 : -height / 2 }]}>
        <Text style={[styles.cardDigits, { fontSize: width * 0.62, color: theme.text }]}>{face.digits}</Text>
        {!!face.corner && (
          <Text style={[styles.corner, { fontSize: width * 0.12, top: width * 0.07, left: width * 0.09, color: theme.muted }]}>
            {face.corner}
          </Text>
        )}
      </View>
      {shade && <Animated.View style={[StyleSheet.absoluteFill, styles.shade, { opacity: shade }]} />}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' },
  simple: { color: colors.text, fontWeight: '100', fontVariant: ['tabular-nums'] },
  simpleAmPm: { color: colors.text, fontWeight: '300' },
  half: { position: 'absolute', left: 0, right: 0, overflow: 'hidden', backgroundColor: colors.surface, backfaceVisibility: 'hidden' },
  face: { position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  shade: { backgroundColor: colors.bg },
  cardDigits: { color: colors.text, fontWeight: '400', fontVariant: ['tabular-nums'], includeFontPadding: false },
  hinge: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: colors.bg },
  corner: { position: 'absolute', color: colors.muted, fontWeight: '600' },
})
