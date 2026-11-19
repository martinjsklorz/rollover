import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { computeFrame, type Frame, type RunState } from '../model/engine'
import type { Moment } from '../model/moment'

const keyOf = (f: Frame) => `${Math.floor(f.t / 1000)}|${f.phase}|${f.cycle}|${Math.ceil(f.remaining / 1000)}`

/**
 * Re-renders only when the visible second / phase / loop changes,
 * but polls every animation frame so second boundaries are crisp.
 */
export function useFrame(m: Moment, run: RunState, onTick?: (now: number) => void): Frame {
  const [frame, setFrame] = useState(() => computeFrame(m, run, Date.now()))
  const key = useRef('')
  const tickRef = useRef(onTick)
  useLayoutEffect(() => {
    tickRef.current = onTick
  })

  useEffect(() => {
    let raf = 0
    let timer = 0
    const loop = () => {
      const now = Date.now()
      tickRef.current?.(now)
      const f = computeFrame(m, run, now)
      const k = keyOf(f)
      if (k !== key.current) {
        key.current = k
        setFrame(f)
      }
    }
    const rafLoop = () => {
      loop()
      raf = requestAnimationFrame(rafLoop)
    }
    raf = requestAnimationFrame(rafLoop)
    // rAF pauses in background tabs; keep logic (e.g. remote status) alive at a slower pace
    timer = window.setInterval(() => document.hidden && loop(), 250)
    loop()
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(timer)
    }
  }, [m, run])

  return frame
}

/** Fires once each time the clock crosses the target (per loop cycle). */
export function useRollover(frame: Frame, active: boolean, fn: () => void, onReset?: () => void) {
  const prev = useRef<{ phase: string; cycle: number } | null>(null)
  const fnRef = useRef(fn)
  const resetRef = useRef(onReset)
  useLayoutEffect(() => {
    fnRef.current = fn
    resetRef.current = onReset
  })
  useEffect(() => {
    const p = prev.current
    prev.current = { phase: frame.phase, cycle: frame.cycle }
    if (!active || !p) return
    if (frame.phase === 'after' && p.phase === 'lead' && frame.since < 1500) fnRef.current()
    else if (frame.phase === 'lead' && (p.phase === 'after' || frame.cycle !== p.cycle)) resetRef.current?.()
  }, [frame.phase, frame.cycle, frame.since, active])
}
