import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native'

type Size = { width: number; height: number }

type Lantern = {
  id: number
  /** keyframes over the lantern's life (0 … 1): position of its top left, and its tilt in degrees */
  steps: number[]
  xs: number[]
  ys: number[]
  tilts: string[]
  durationMs: number
  delayMs: number
  /** body width; everything else is measured in it */
  width: number
  paper: string
  /** smaller lanterns are a little dimmer, as if further away */
  opacity: number
}

// react-native-web has no native animation driver
const useNativeDriver = Platform.OS !== 'web'
/** lanterns let go together the moment the clock hits midnight, spread across the width */
const RELEASE = 6
/** each lantern lets go within this time; slower than balloons */
const RELEASE_SPREAD_MS = 1600
/** one more lantern this often, until the loop starts over */
const MORE_EVERY_MS = 1100
/** lanterns on screen at once; keeps the view count down (9 views each) */
const MAX_LANTERNS = 14
/** keyframe spacing in seconds */
const DT = 0.1
/** caps, loop and tassel */
const GOLD = '#F2BE4A'
/** seconds a lantern takes to reach its full speed: heavy things start slowly */
const TAU = 1.2

/** the parts, in body widths: the loop on top, the caps, the paper body and the tassel below */
const LOOP = 0.14
const CAP = 0.1
const BODY = 0.8
const CORD = 0.1
const TASSEL = 0.34
const HEIGHT = LOOP + CAP + BODY + CORD + TASSEL
/** where it swings from: the middle of the body */
const PIVOT = (LOOP + CAP / 2 + BODY / 2) / HEIGHT

const rand = (min: number, max: number) => min + Math.random() * (max - min)
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]

/**
 * One lantern rising from just below the bottom edge at `x` (its middle) until its loop has left the
 * top edge. Calmer and heavier than a balloon: it picks up speed slowly, rises at about half a balloon's
 * pace, and sways less and slower. Sampled into keyframes.
 */
function makeLantern(id: number, size: Size, paper: string[], x: number, delayMs: number): Lantern {
  const short = Math.min(size.width, size.height)
  const scale = rand(0, 1)
  const width = short * (0.09 + 0.06 * scale)
  const height = width * HEIGHT
  const speed = size.height * rand(0.09, 0.13)
  const sway = width * rand(0.12, 0.28)
  const swayHz = rand(0.12, 0.22)
  const lean = rand(2, 4)
  const phase = rand(0, 2 * Math.PI)
  const y0 = size.height + width * 0.1
  // with the slow start, it covers speed * (t - TAU) by the time it's at full speed
  const life = (y0 + height) / speed + TAU
  const xs: number[] = []
  const ys: number[] = []
  const tilts: string[] = []
  const steps: number[] = []
  for (let t = 0; ; t = Math.min(life, t + DT)) {
    const a = 2 * Math.PI * swayHz * t + phase
    steps.push(t / life)
    xs.push(x - width / 2 + sway * Math.sin(a))
    ys.push(y0 - speed * (t - TAU * (1 - Math.exp(-t / TAU))))
    // leans the way it's swaying
    tilts.push(`${lean * Math.cos(a)}deg`)
    if (t >= life) break
  }
  return { id, steps, xs, ys, tilts, durationMs: life * 1000, delayMs, width, paper: pick(paper), opacity: 0.75 + 0.25 * scale }
}

/**
 * Red paper lanterns over the clock, for as long as it is mounted: a few let go across the bottom edge
 * the moment it appears, then one more every so often. The paper takes the theme's first two accents.
 * Draws nothing itself, so place it absolutely behind the digits.
 */
export default memo(function Lanterns({ size, colors }: { size: Size; colors: string[] }) {
  const [lanterns, setLanterns] = useState<Lantern[]>([])
  const nextId = useRef(0)

  useEffect(() => {
    const id = () => nextId.current++
    const paper = colors.slice(0, 2)
    setLanterns(
      Array.from({ length: RELEASE }, (_, i) =>
        makeLantern(id(), size, paper, size.width * ((i + rand(0.2, 0.8)) / RELEASE), rand(0, RELEASE_SPREAD_MS)),
      ),
    )
    const more = setInterval(() => {
      setLanterns((l) => (l.length >= MAX_LANTERNS ? l : [...l, makeLantern(id(), size, paper, size.width * rand(0.05, 0.95), 0)]))
    }, MORE_EVERY_MS)
    return () => clearInterval(more)
  }, [size, colors])

  const done = useCallback((id: number) => setLanterns((l) => l.filter((x) => x.id !== id)), [])

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {lanterns.map((l) => (
        <LanternView key={l.id} lantern={l} onDone={done} />
      ))}
    </View>
  )
})

/** One lantern on its way up: a round paper body with ribs, gold caps, a loop on top and a tassel. Flat. */
const LanternView = memo(function LanternView({ lantern, onDone }: { lantern: Lantern; onDone: (id: number) => void }) {
  // not useAnimatedValue: react-native-web doesn't export it
  const [life] = useState(() => new Animated.Value(0))

  useEffect(() => {
    const animation = Animated.timing(life, {
      toValue: 1,
      duration: lantern.durationMs,
      delay: lantern.delayMs,
      easing: Easing.linear,
      useNativeDriver,
    })
    animation.start(({ finished }) => finished && onDone(lantern.id))
    return () => animation.stop()
  }, []) // runs once per lantern

  const { steps, xs, ys, tilts, width: w, paper, opacity } = lantern
  const line = Math.max(1, w * 0.025)
  const bodyTop = (LOOP + CAP / 2) * w
  const body = BODY * w
  const capWidth = w * 0.44
  const bottomCap = bodyTop + body - (CAP / 2) * w
  const cordTop = bottomCap + CAP * w
  const rib = { position: 'absolute', top: bodyTop, height: body, borderColor: 'rgba(0,0,0,0.22)', borderWidth: line } as const
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: w,
        height: HEIGHT * w,
        opacity,
        transformOrigin: `50% ${PIVOT * 100}%`,
        transform: [
          { translateX: life.interpolate({ inputRange: steps, outputRange: xs }) },
          { translateY: life.interpolate({ inputRange: steps, outputRange: ys }) },
          { rotate: life.interpolate({ inputRange: steps, outputRange: tilts }) },
        ],
      }}
    >
      {/* the loop it hangs from */}
      <View style={{ position: 'absolute', left: w / 2 - line / 2, top: 0, width: line, height: LOOP * w + 1, backgroundColor: GOLD }} />
      {/* the tassel: a cord and a bunch of threads */}
      <View style={{ position: 'absolute', left: w / 2 - line / 2, top: cordTop - 1, width: line, height: CORD * w + 2, backgroundColor: GOLD }} />
      <View
        style={{
          position: 'absolute',
          left: w * 0.45,
          top: cordTop + CORD * w,
          width: w * 0.1,
          height: TASSEL * w,
          borderBottomLeftRadius: w * 0.03,
          borderBottomRightRadius: w * 0.03,
          backgroundColor: GOLD,
        }}
      />
      {/* a circle squashed into a round lantern: as tall as `body`, from `bodyTop` */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: bodyTop + (body - w) / 2,
          width: w,
          height: w,
          borderRadius: w / 2,
          backgroundColor: paper,
          transform: [{ scaleY: BODY }],
        }}
      />
      {/* the ribs: a narrow oval and the middle line */}
      <View style={[rib, { left: w * 0.27, width: w * 0.46, borderRadius: w * 0.23 }]} />
      <View style={{ position: 'absolute', left: w / 2 - line / 2, top: bodyTop, width: line, height: body, backgroundColor: 'rgba(0,0,0,0.22)' }} />
      {/* the gold caps */}
      <View
        style={{
          position: 'absolute',
          left: (w - capWidth) / 2,
          top: LOOP * w,
          width: capWidth,
          height: CAP * w,
          borderRadius: w * 0.02,
          backgroundColor: GOLD,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: (w - capWidth) / 2,
          top: bottomCap,
          width: capWidth,
          height: CAP * w,
          borderRadius: w * 0.02,
          backgroundColor: GOLD,
        }}
      />
    </Animated.View>
  )
})
