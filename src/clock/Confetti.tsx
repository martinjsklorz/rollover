import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Easing, StyleSheet, View } from 'react-native'
import { pick, rand, useNativeDriver, type Size } from './motion'

type Piece = {
  id: number
  /** keyframes over the piece's life (0 … 1): position, relative to the screen's top left */
  steps: number[]
  xs: number[]
  ys: number[]
  durationMs: number
  width: number
  height: number
  round: boolean
  color: string
  /** turns in the screen's plane and around its own axis (the flutter), over its whole life */
  spin: number
  flips: number
}

/** pieces each corner shoots the moment the clock hits midnight */
const CANNON = 36
/** pieces on screen at once; keeps the view count down */
const MAX_PIECES = 150
const RAIN_EVERY_MS = 250
/** air drag per second: pieces lose their speed fast and drift down at their terminal speed */
const DRAG = 2.5
/** keyframe spacing in seconds */
const DT = 0.1
const MAX_LIFE = 10

/**
 * One piece of paper: thrown from (x0, y0) at (vx, vy) px/s, slowed by the air, falling at
 * `fall` px/s once it has lost its speed and swaying side to side as it goes. Sampled into
 * keyframes until it leaves the bottom edge.
 */
function makePiece(id: number, size: Size, colors: string[], x0: number, y0: number, vx: number, vy: number, fall: number): Piece {
  const short = Math.min(size.width, size.height)
  const width = Math.max(3, short * rand(0.018, 0.028))
  const round = Math.random() < 0.25
  const sway = short * rand(0.015, 0.04)
  const swayHz = rand(0.4, 0.9)
  const phase = rand(0, 2 * Math.PI)
  const xs: number[] = []
  const ys: number[] = []
  let t = 0
  for (;;) {
    const slowed = (1 - Math.exp(-DRAG * t)) / DRAG
    // sway sets in as the throw dies down
    const drift = sway * (1 - Math.exp(-DRAG * t)) * Math.sin(2 * Math.PI * swayHz * t + phase)
    const y = y0 + fall * t + (vy - fall) * slowed
    xs.push(x0 + vx * slowed + drift)
    ys.push(y)
    if (y > size.height + width * 2 || t >= MAX_LIFE) break
    t += DT
  }
  const life = t || DT
  return {
    id,
    steps: xs.map((_, i) => Math.min(1, (i * DT) / life)),
    xs,
    ys,
    durationMs: life * 1000,
    // dots are a bit smaller than the strips
    width: round ? width * 0.7 : width,
    height: round ? width * 0.7 : width * rand(0.4, 0.6),
    round,
    color: pick(colors),
    spin: rand(-0.6, 0.6) * life,
    flips: rand(1, 2.5) * life,
  }
}

/** Thrown up from a bottom corner, towards the middle of the screen. */
function cannonPiece(id: number, size: Size, colors: string[], left: boolean): Piece {
  const { width: w, height: h } = size
  // with drag, a throw at v travels v / DRAG before it stops; aim each piece at a point
  const reach = w * rand(0.05, 0.6)
  const climb = h * rand(0.45, 0.95)
  return makePiece(id, size, colors, left ? 0 : w, h, (left ? 1 : -1) * reach * DRAG, -climb * DRAG * 1.15, h * rand(0.12, 0.2))
}

/** Drifting down from just above the top edge. */
function rainPiece(id: number, size: Size, colors: string[]): Piece {
  const fall = size.height * rand(0.12, 0.2)
  return makePiece(id, size, colors, size.width * rand(0, 1), -size.height * 0.04, 0, fall, fall)
}

/**
 * Confetti over the clock, for as long as it is mounted: both bottom corners pop the moment it
 * appears, then it keeps raining down from the top.
 * Draws nothing itself, so place it absolutely behind the digits.
 */
export default memo(function Confetti({ size, colors }: { size: Size; colors: string[] }) {
  const [pieces, setPieces] = useState<Piece[]>([])
  const nextId = useRef(0)

  useEffect(() => {
    const id = () => nextId.current++
    setPieces([
      ...Array.from({ length: CANNON }, () => cannonPiece(id(), size, colors, true)),
      ...Array.from({ length: CANNON }, () => cannonPiece(id(), size, colors, false)),
    ])
    const rain = setInterval(() => {
      const count = Math.round(rand(2, 4))
      setPieces((p) =>
        p.length >= MAX_PIECES ? p : [...p, ...Array.from({ length: count }, () => rainPiece(id(), size, colors))],
      )
    }, RAIN_EVERY_MS)
    return () => clearInterval(rain)
  }, [size, colors])

  const done = useCallback((id: number) => setPieces((p) => p.filter((x) => x.id !== id)), [])

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((p) => (
        <PieceView key={p.id} piece={p} onDone={done} />
      ))}
    </View>
  )
})

/** One piece of paper on its way down, spinning and fluttering. */
const PieceView = memo(function PieceView({ piece, onDone }: { piece: Piece; onDone: (id: number) => void }) {
  // not useAnimatedValue: react-native-web doesn't export it
  const [life] = useState(() => new Animated.Value(0))

  useEffect(() => {
    const animation = Animated.timing(life, { toValue: 1, duration: piece.durationMs, easing: Easing.linear, useNativeDriver })
    animation.start(({ finished }) => finished && onDone(piece.id))
    return () => animation.stop()
  }, []) // runs once per piece

  const { steps, xs, ys, width, height, round, color, spin, flips } = piece
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: -width / 2,
        top: -height / 2,
        width,
        height,
        borderRadius: round ? height / 2 : 1,
        backgroundColor: color,
        transform: [
          { translateX: life.interpolate({ inputRange: steps, outputRange: xs }) },
          { translateY: life.interpolate({ inputRange: steps, outputRange: ys }) },
          { rotate: life.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${spin * 360}deg`] }) },
          // turning around its long axis makes it flash and flutter like paper
          { rotateX: life.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${flips * 360}deg`] }) },
        ],
      }}
    />
  )
})
