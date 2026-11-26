import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Easing, StyleSheet, View } from 'react-native'
import { pick, rand, useNativeDriver, type Size } from './motion'

type Balloon = {
  id: number
  /** keyframes over the balloon's life (0 … 1): position of its top left, and its tilt in degrees */
  steps: number[]
  xs: number[]
  ys: number[]
  tilts: string[]
  durationMs: number
  delayMs: number
  /** body width; the body is 1.2 times as tall */
  width: number
  string: number
  color: string
}

/** balloons let go together the moment the clock hits midnight, spread across the width */
const RELEASE = 9
/** the release isn't all at once: each balloon lets go within this time */
const RELEASE_SPREAD_MS = 900
/** one more balloon this often, until the loop starts over */
const MORE_EVERY_MS = 700
/** balloons on screen at once; keeps the view count down */
const MAX_BALLOONS = 22
/** body height / body width */
const STRETCH = 1.2
/** keyframe spacing in seconds */
const DT = 0.1

/**
 * One balloon rising from just below the bottom edge at `x` (its middle) until its string has left
 * the top edge, swaying side to side and leaning into the sway. Sampled into keyframes.
 */
function makeBalloon(id: number, size: Size, colors: string[], x: number, delayMs: number): Balloon {
  const short = Math.min(size.width, size.height)
  const width = short * rand(0.09, 0.13)
  const body = width * STRETCH
  const string = body * rand(1.2, 1.7)
  const speed = size.height * rand(0.22, 0.32)
  const sway = width * rand(0.25, 0.5)
  const swayHz = rand(0.25, 0.45)
  const lean = rand(5, 9)
  const phase = rand(0, 2 * Math.PI)
  const y0 = size.height + width * 0.2
  const life = (y0 + body + string) / speed
  const xs: number[] = []
  const ys: number[] = []
  const tilts: string[] = []
  const steps: number[] = []
  for (let t = 0; ; t = Math.min(life, t + DT)) {
    const a = 2 * Math.PI * swayHz * t + phase
    steps.push(t / life)
    xs.push(x - width / 2 + sway * Math.sin(a))
    ys.push(y0 - speed * t)
    // leans the way it's swaying
    tilts.push(`${lean * Math.cos(a)}deg`)
    if (t >= life) break
  }
  return { id, steps, xs, ys, tilts, durationMs: life * 1000, delayMs, width, string, color: pick(colors) }
}

/**
 * Balloons over the clock, for as long as it is mounted: a bunch is let go across the bottom edge
 * the moment it appears, then one more every so often.
 * Draws nothing itself, so place it absolutely behind the digits.
 */
export default memo(function Balloons({ size, colors }: { size: Size; colors: string[] }) {
  const [balloons, setBalloons] = useState<Balloon[]>([])
  const nextId = useRef(0)

  useEffect(() => {
    const id = () => nextId.current++
    setBalloons(
      Array.from({ length: RELEASE }, (_, i) =>
        makeBalloon(id(), size, colors, size.width * ((i + rand(0.2, 0.8)) / RELEASE), rand(0, RELEASE_SPREAD_MS)),
      ),
    )
    const more = setInterval(() => {
      setBalloons((b) => (b.length >= MAX_BALLOONS ? b : [...b, makeBalloon(id(), size, colors, size.width * rand(0.05, 0.95), 0)]))
    }, MORE_EVERY_MS)
    return () => clearInterval(more)
  }, [size, colors])

  const done = useCallback((id: number) => setBalloons((b) => b.filter((x) => x.id !== id)), [])

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {balloons.map((b) => (
        <BalloonView key={b.id} balloon={b} onDone={done} />
      ))}
    </View>
  )
})

/** One balloon on its way up: an oval body with a shine, a knot and a string. Flat, like the rest of the app. */
const BalloonView = memo(function BalloonView({ balloon, onDone }: { balloon: Balloon; onDone: (id: number) => void }) {
  // not useAnimatedValue: react-native-web doesn't export it
  const [life] = useState(() => new Animated.Value(0))

  useEffect(() => {
    const animation = Animated.timing(life, {
      toValue: 1,
      duration: balloon.durationMs,
      delay: balloon.delayMs,
      easing: Easing.linear,
      useNativeDriver,
    })
    animation.start(({ finished }) => finished && onDone(balloon.id))
    return () => animation.stop()
  }, []) // runs once per balloon

  const { steps, xs, ys, tilts, width, string, color } = balloon
  const body = width * STRETCH
  const knot = width * 0.13
  const height = body + string
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width,
        height,
        // swings from the knot, the string trailing below
        transformOrigin: `50% ${(body / height) * 100}%`,
        transform: [
          { translateX: life.interpolate({ inputRange: steps, outputRange: xs }) },
          { translateY: life.interpolate({ inputRange: steps, outputRange: ys }) },
          { rotate: life.interpolate({ inputRange: steps, outputRange: tilts }) },
        ],
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: width / 2 - Math.max(1, width * 0.02) / 2,
          top: body,
          width: Math.max(1, width * 0.02),
          height: string,
          backgroundColor: 'rgba(255,255,255,0.35)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: width / 2 - knot / 2,
          top: body - knot * 0.6,
          width: knot,
          height: knot,
          backgroundColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
      {/* a circle stretched into an oval: as tall as `body`, from the top */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: (body - width) / 2,
          width,
          height: width,
          borderRadius: width / 2,
          backgroundColor: color,
          transform: [{ scaleY: STRETCH }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: width * 0.2,
          top: body * 0.14,
          width: width * 0.16,
          height: width * 0.3,
          borderRadius: width * 0.08,
          backgroundColor: '#FFFFFF',
          opacity: 0.35,
          transform: [{ rotate: '20deg' }],
        }}
      />
    </Animated.View>
  )
})
