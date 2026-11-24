import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { Animated, Easing, Platform, StyleSheet, Text, View, type LayoutChangeEvent, type ViewStyle } from 'react-native'
import { useStrings } from '../i18n'
import type { Settings } from '../settings'
import { colors, themeOf, type ClockTheme } from '../theme'
import { useLayoutSize, type Size } from '../useLayoutSize'
import Balloons from './Balloons'
import Confetti from './Confetti'
import Fireworks from './Fireworks'
import { formatTime, loopTime, timeParts, useLoop, type TimeParts } from './time'

// react-native-web has no native animation driver
const useNativeDriver = Platform.OS !== 'web'

/**
 * The looping clock. Fills its parent and sizes itself to fit,
 * so the same component is used for the wizard preview and the full screen.
 * The loop runs from `startedAt`; pass a new value to restart it.
 * `sizeKey` remembers the size, so a clock in the same spot on the next screen shows from its first frame.
 * `onMidnight` runs at each 00:00:00, on the tick the midnight animation starts, and `onLoopStart` when the
 * loop starts over (the full-screen clock's sound; the wizard preview passes neither and stays silent).
 */
export default function Clock({
  settings,
  startedAt,
  sizeKey,
  onMidnight,
  onLoopStart,
}: {
  settings: Settings
  startedAt: number
  sizeKey?: string
  onMidnight?: () => void
  onLoopStart?: () => void
}) {
  const [size, onLayout] = useLayoutSize(sizeKey)
  return (
    <View style={styles.fill} onLayout={onLayout}>
      {/* key: a new start shows its first second right away, not the old loop's for a frame */}
      {size && (
        <LoopingFace key={startedAt} settings={settings} startedAt={startedAt} size={size} onMidnight={onMidnight} onLoopStart={onLoopStart} />
      )}
    </View>
  )
}

function LoopingFace({
  settings,
  startedAt,
  size,
  onMidnight,
  onLoopStart,
}: {
  settings: Settings
  startedAt: number
  size: Size
  onMidnight?: () => void
  onLoopStart?: () => void
}) {
  const elapsed = useLoop(settings.before + settings.after, startedAt)
  const time = loopTime(settings.before, elapsed)
  const parts = timeParts(time, settings.hour12)
  const theme = themeOf(settings.theme)
  // from 00:00:00 until the loop starts over
  const afterMidnight = elapsed >= settings.before
  // fires when that changes, not on the first render: a tick late (a throttled tab) still counts
  const wasAfterMidnight = useRef(afterMidnight)
  const rolledOver = useEffectEvent((midnight: boolean) => (midnight ? onMidnight?.() : onLoopStart?.()))
  useEffect(() => {
    if (afterMidnight === wasAfterMidnight.current) return
    wasAfterMidnight.current = afterMidnight
    rolledOver(afterMidnight)
  }, [afterMidnight])
  // the greeting goes in the space below the digits
  const [faceHeight, setFaceHeight] = useState(0)
  const name = settings.name.trim()
  const t = useStrings()
  return (
    <>
      {afterMidnight && settings.animation === 'fireworks' && <Fireworks size={size} colors={theme.accents} />}
      {afterMidnight && settings.animation === 'confetti' && <Confetti size={size} colors={theme.accents} />}
      {afterMidnight && settings.animation === 'balloons' && <Balloons size={size} colors={theme.accents} />}
      {/* screen readers get the time as one name, not the digits and colons one by one */}
      <View role="timer" aria-label={formatTime(time, settings.hour12)}>
        <View aria-hidden onLayout={(e) => setFaceHeight(e.nativeEvent.layout.height)}>
          {settings.style === 'flip' ? <FlipFace parts={parts} size={size} theme={theme} /> : <SimpleFace parts={parts} size={size} theme={theme} />}
        </View>
      </View>
      {afterMidnight && settings.occasion === 'birthday' && faceHeight > 0 && (
        <Greeting text={name ? t.clock.birthdayName(name) : t.clock.birthday} color={theme.text} size={size} faceHeight={faceHeight} />
      )}
    </>
  )
}

/* ---------- birthday greeting ---------- */

const GREETING_DELAY_MS = 300
const GREETING_FADE_MS = 900

/** One line under the digits, fading in at midnight. Sized to the space between the digits and the bottom edge. */
function Greeting({ text, color, size, faceHeight }: { text: string; color: string; size: Size; faceHeight: number }) {
  const [opacity] = useState(() => new Animated.Value(0))
  useEffect(() => {
    const fade = Animated.timing(opacity, {
      toValue: 1,
      delay: GREETING_DELAY_MS,
      duration: GREETING_FADE_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver,
    })
    fade.start()
    return () => fade.stop()
  }, [opacity])
  const space = (size.height - faceHeight) / 2
  // keep the line within 90 % of the width
  const fontSize = Math.min(space * 0.42, (size.width * 0.9) / textWidthEm(text), size.height * 0.08)
  // no room on a very small preview
  if (fontSize < 8) return null
  return (
    <View style={[styles.greeting, { top: size.height - space, height: space }]} pointerEvents="none">
      <Animated.Text style={[styles.greetingText, { color, fontSize, opacity }]} numberOfLines={1}>
        {text}
      </Animated.Text>
    </View>
  )
}

/** CJK and Hangul characters are about 1 em wide */
const WIDE = /[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]/

/** Rough width of a line in em: light type is about 0.55 em per character, wide characters about 1 em. */
const textWidthEm = (text: string) => [...text].reduce((em, c) => em + (WIDE.test(c) ? 1 : 0.55), 0)

/* ---------- simple: thin white digits ---------- */

/** measured digit widths, kept for the next clock so it doesn't start hidden */
const measuredWidthPerPoint: { hour12?: number; hour24?: number } = {}

function SimpleFace({ parts, size, theme }: { parts: TimeParts; size: Size; theme: ClockTheme }) {
  // The digits' width per point of font size depends on the font, so it's measured: the first
  // render uses a safe guess (hidden), then the digits are sized to fill the width.
  const format = parts.ampm ? 'hour12' : 'hour24'
  const [widthPerPoint, setWidthPerPoint] = useState(() => measuredWidthPerPoint[format] ?? null)
  const fontSize = Math.min((size.width * 0.94) / (widthPerPoint ?? (parts.ampm ? 6.2 : 5)), size.height * 0.5)
  const onLayout = (e: LayoutChangeEvent) => {
    // hidden (see Clock): a 0 width would count as unmeasured and hide the digits for good
    if (!e.nativeEvent.layout.width || !fontSize) return
    const measured = e.nativeEvent.layout.width / fontSize
    // AM and PM differ slightly in width; don't resize the digits for that
    if (!widthPerPoint || Math.abs(measured - widthPerPoint) / widthPerPoint > 0.03) {
      measuredWidthPerPoint[format] = measured
      setWidthPerPoint(measured)
    }
  }
  const color = { color: theme.text }
  const glow = theme.glow && { textShadowColor: theme.text, textShadowRadius: fontSize * 0.12, textShadowOffset: { width: 0, height: 0 } }
  return (
    <View style={[styles.row, !widthPerPoint && styles.measuring]} onLayout={onLayout}>
      <Text style={[styles.simple, color, glow, { fontSize }]} numberOfLines={1}>
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
          // at least 9 pt, so AM/PM stays readable on the small preview cards
          <Text style={[styles.corner, { fontSize: Math.max(width * 0.12, 9), top: width * 0.07, left: width * 0.09, color: theme.muted }]}>
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
  measuring: { opacity: 0 },
  simple: { color: colors.text, fontWeight: '100', fontVariant: ['tabular-nums'], flexShrink: 0 },
  simpleAmPm: { color: colors.text, fontWeight: '300' },
  half: { position: 'absolute', left: 0, right: 0, overflow: 'hidden', backgroundColor: colors.surface, backfaceVisibility: 'hidden' },
  face: { position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  shade: { backgroundColor: colors.bg },
  cardDigits: { color: colors.text, fontWeight: '400', fontVariant: ['tabular-nums'], includeFontPadding: false },
  hinge: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: colors.bg },
  corner: { position: 'absolute', color: colors.muted, fontWeight: '600' },
  greeting: { position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  greetingText: { fontWeight: '300', textAlign: 'center' },
})
