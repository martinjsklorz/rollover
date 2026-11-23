import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native'

type Size = { width: number; height: number }

type Spark = { dx: number; dy: number; angle: string; color: string }

type Burst = {
  id: number
  /** where it bursts */
  x: number
  y: number
  /** how far the rocket climbs from the bottom edge */
  climb: number
  radius: number
  /** spark thickness */
  thickness: number
  color: string
  sparks: Spark[]
}

// react-native-web has no native animation driver
const useNativeDriver = Platform.OS !== 'web'
const RISE_MS = 650
const BURST_MS = 1700
/** bursts on screen at once; keeps the view count down */
const MAX_BURSTS = 6
/** rockets fired together the moment the clock hits midnight */
const VOLLEY_MS = [0, 180, 360]

const rand = (min: number, max: number) => min + Math.random() * (max - min)
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]

function ring(count: number, radius: number, spread: [number, number], offset: number, color: string): Spark[] {
  return Array.from({ length: count }, (_, i) => {
    const a = offset + (i / count) * 2 * Math.PI + rand(-0.08, 0.08)
    const r = radius * rand(...spread)
    return { dx: Math.cos(a) * r, dy: Math.sin(a) * r, angle: `${a}rad`, color }
  })
}

function makeBurst(id: number, size: Size, colors: string[]): Burst {
  const short = Math.min(size.width, size.height)
  const radius = short * rand(0.2, 0.34)
  const color = pick(colors)
  const y = size.height * rand(0.12, 0.5)
  return {
    id,
    x: size.width * rand(0.15, 0.85),
    y,
    climb: size.height - y,
    radius,
    thickness: Math.max(2, short * 0.011),
    color,
    // an outer ring and an inner ring, often in a second color
    sparks: [...ring(24, radius, [0.85, 1], 0, color), ...ring(10, radius, [0.4, 0.55], 0.3, pick(colors))],
  }
}

/**
 * Rockets and bursts over the clock, for as long as it is mounted:
 * a volley the moment it appears, then one rocket every half second or so.
 * Draws nothing itself, so place it absolutely behind the digits.
 */
export default memo(function Fireworks({ size, colors }: { size: Size; colors: string[] }) {
  const [bursts, setBursts] = useState<Burst[]>([])
  const nextId = useRef(0)

  useEffect(() => {
    const launch = () =>
      setBursts((b) => (b.length >= MAX_BURSTS ? b : [...b, makeBurst(nextId.current++, size, colors)]))
    const volley = VOLLEY_MS.map((ms) => setTimeout(launch, ms))
    let next: ReturnType<typeof setTimeout> | undefined
    const schedule = () => {
      next = setTimeout(() => {
        launch()
        schedule()
      }, rand(450, 900))
    }
    schedule()
    return () => {
      volley.forEach(clearTimeout)
      clearTimeout(next)
    }
  }, [size, colors])

  const done = useCallback((id: number) => setBursts((b) => b.filter((x) => x.id !== id)), [])

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {bursts.map((b) => (
        <BurstView key={b.id} burst={b} onDone={done} />
      ))}
    </View>
  )
})

/** One rocket climbing from the bottom edge, then its burst of sparks falling and twinkling out. */
const BurstView = memo(function BurstView({ burst, onDone }: { burst: Burst; onDone: (id: number) => void }) {
  // not useAnimatedValue: react-native-web doesn't export it
  const [rise] = useState(() => new Animated.Value(0))
  const [blast] = useState(() => new Animated.Value(0))

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.timing(rise, { toValue: 1, duration: RISE_MS, easing: Easing.out(Easing.quad), useNativeDriver }),
      Animated.timing(blast, { toValue: 1, duration: BURST_MS, easing: Easing.linear, useNativeDriver }),
    ])
    animation.start(({ finished }) => finished && onDone(burst.id))
    return () => animation.stop()
  }, []) // runs once per burst

  const { x, y, climb, radius, thickness: t, color } = burst
  // sparks slow down as they fly out (most of the distance in the first 40%) while gravity pulls them down
  const gravity = radius * 0.6
  const steps = [0, 0.15, 0.4, 1]
  const out = [0, 0.6, 0.9, 1]
  const fall = steps.map((s) => gravity * s * s)
  const sparkOpacity = blast.interpolate({ inputRange: [0, 0.05, 0.6, 0.7, 0.8, 0.9, 1], outputRange: [0, 1, 0.8, 0.4, 0.8, 0.3, 0] })
  const sparkScale = blast.interpolate({ inputRange: [0, 1], outputRange: [1, 0.35] })
  const flash = radius * 0.4

  return (
    <>
      <Animated.View
        style={[
          styles.rocket,
          { left: x - t / 2, top: y - t / 2 },
          {
            opacity: rise.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0] }),
            transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [climb, 0] }) }],
          },
        ]}
      >
        <View style={{ width: t, height: t, borderRadius: t / 2, backgroundColor: color }} />
        <View style={[styles.trail, { width: t * 0.5, height: t * 10, borderRadius: t / 4, backgroundColor: color }]} />
      </Animated.View>

      <Animated.View
        style={{
          position: 'absolute',
          left: x - flash / 2,
          top: y - flash / 2,
          width: flash,
          height: flash,
          borderRadius: flash / 2,
          backgroundColor: color,
          opacity: blast.interpolate({ inputRange: [0, 0.02, 0.08, 0.25], outputRange: [0, 0.8, 0.3, 0], extrapolate: 'clamp' }),
          transform: [{ scale: blast.interpolate({ inputRange: [0, 0.25], outputRange: [0.2, 1.4], extrapolate: 'clamp' }) }],
        }}
      />

      {burst.sparks.map((s, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: x - t * 1.3,
            top: y - t / 2,
            width: t * 2.6,
            height: t,
            borderRadius: t / 2,
            backgroundColor: s.color,
            opacity: sparkOpacity,
            transform: [
              { translateX: blast.interpolate({ inputRange: steps, outputRange: out.map((o) => o * s.dx) }) },
              { translateY: blast.interpolate({ inputRange: steps, outputRange: out.map((o, j) => o * s.dy + fall[j]) }) },
              // streaks point the way they fly
              { rotate: s.angle },
              { scale: sparkScale },
            ],
          }}
        />
      ))}
    </>
  )
})

const styles = StyleSheet.create({
  rocket: { position: 'absolute', alignItems: 'center' },
  trail: { opacity: 0.35, marginTop: 1 },
})
